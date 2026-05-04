from math import radians, sin, cos, sqrt, asin
from typing import List, Optional

from fastapi import FastAPI
from pydantic import BaseModel, Field
from ortools.constraint_solver import pywrapcp, routing_enums_pb2

app = FastAPI(title="Route Optimizer Service")


class Location(BaseModel):
    id: str
    lat: float
    lng: float
    demand: int = 0


class OptimizeRequest(BaseModel):
    depot: Location
    stops: List[Location]
    vehicle_count: int = Field(default=1, ge=1)
    vehicle_capacities: Optional[List[int]] = None


class RouteStop(BaseModel):
    id: str
    lat: float
    lng: float
    demand: int
    sequence: int
    distance_from_previous_m: int


class RouteResult(BaseModel):
    vehicle_index: int
    total_distance_m: int
    total_demand: int
    stops: List[RouteStop]


class OptimizeResponse(BaseModel):
    routes: List[RouteResult]
    unassigned_stops: List[str]


def haversine_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> int:
    radius_m = 6371000
    phi1 = radians(lat1)
    phi2 = radians(lat2)
    delta_phi = radians(lat2 - lat1)
    delta_lambda = radians(lng2 - lng1)

    a = sin(delta_phi / 2) ** 2 + cos(phi1) * cos(phi2) * sin(delta_lambda / 2) ** 2
    return int(2 * radius_m * asin(sqrt(a)))


def create_distance_matrix(locations: List[Location]) -> List[List[int]]:
    matrix: List[List[int]] = []
    for origin in locations:
        row = []
        for destination in locations:
            row.append(
                haversine_meters(origin.lat, origin.lng, destination.lat, destination.lng)
            )
        matrix.append(row)
    return matrix


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/optimize", response_model=OptimizeResponse)
def optimize(request: OptimizeRequest):
    locations = [request.depot] + request.stops
    distance_matrix = create_distance_matrix(locations)
    demands = [0] + [stop.demand for stop in request.stops]
    vehicle_capacities = request.vehicle_capacities or [10**9] * request.vehicle_count

    manager = pywrapcp.RoutingIndexManager(
        len(locations),
        request.vehicle_count,
        0,
    )
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index: int, to_index: int) -> int:
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return distance_matrix[from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    def demand_callback(from_index: int) -> int:
        from_node = manager.IndexToNode(from_index)
        return demands[from_node]

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,
        vehicle_capacities,
        True,
        "Capacity",
    )

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    search_parameters.local_search_metaheuristic = routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    search_parameters.time_limit.FromSeconds(2)

    solution = routing.SolveWithParameters(search_parameters)
    if not solution:
        return OptimizeResponse(routes=[], unassigned_stops=[stop.id for stop in request.stops])

    routes: List[RouteResult] = []
    used_stop_ids = set()

    for vehicle_id in range(request.vehicle_count):
        index = routing.Start(vehicle_id)
        total_distance = 0
        total_demand = 0
        sequence = 0
        route_stops: List[RouteStop] = []
        previous_node = 0

        while not routing.IsEnd(index):
            node_index = manager.IndexToNode(index)
            if node_index != 0:
                stop = request.stops[node_index - 1]
                used_stop_ids.add(stop.id)
                distance_from_previous = distance_matrix[previous_node][node_index]
                route_stops.append(
                    RouteStop(
                        id=stop.id,
                        lat=stop.lat,
                        lng=stop.lng,
                        demand=stop.demand,
                        sequence=sequence,
                        distance_from_previous_m=distance_from_previous,
                    )
                )
                total_distance += distance_from_previous
                total_demand += stop.demand
                sequence += 1
                previous_node = node_index
            index = solution.Value(routing.NextVar(index))

        if route_stops:
            total_distance += distance_matrix[previous_node][0]
            routes.append(
                RouteResult(
                    vehicle_index=vehicle_id,
                    total_distance_m=total_distance,
                    total_demand=total_demand,
                    stops=route_stops,
                )
            )

    unassigned = [stop.id for stop in request.stops if stop.id not in used_stop_ids]
    return OptimizeResponse(routes=routes, unassigned_stops=unassigned)
