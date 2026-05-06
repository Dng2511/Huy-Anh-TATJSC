const Joi = require('joi');

// Vehicle validation schema
const vehicleSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'Vehicle ID cannot be empty',
    'any.required': 'Vehicle ID is required',
  }),
  licensePlate: Joi.string().required().uppercase().messages({
    'string.empty': 'License plate cannot be empty',
    'any.required': 'License plate is required',
  }),
  fuelRate: Joi.number().positive().required().messages({
    'number.positive': 'Fuel rate must be a positive number',
    'any.required': 'Fuel rate is required',
  }),
  status: Joi.string()
    .valid('idle', 'running', 'maintenance')
    .default('idle'),
});

// Driver validation schema
const driverSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'Driver ID cannot be empty',
    'any.required': 'Driver ID is required',
  }),
  name: Joi.string().required().messages({
    'string.empty': 'Name cannot be empty',
    'any.required': 'Name is required',
  }),
  phone: Joi.string()
    .required()
    .pattern(/^[0-9\-\+\s]+$/)
    .messages({
      'string.pattern.base': 'Phone number is invalid',
      'any.required': 'Phone number is required',
    }),
  licenseNumber: Joi.string().required().uppercase().messages({
    'string.empty': 'License number cannot be empty',
    'any.required': 'License number is required',
  }),
  status: Joi.string()
    .valid('available', 'on_trip', 'off')
    .default('available'),
});

// Order validation schema
const orderSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'Order ID cannot be empty',
    'any.required': 'Order ID is required',
  }),
  type: Joi.string().valid('IN', 'OUT').required().messages({
    'any.only': 'Order type must be either IN or OUT',
    'any.required': 'Order type is required',
  }),
  location: Joi.string()
    .valid('A', 'B')
    .required()
    .messages({
      'any.only': 'Location must be either A or B',
      'any.required': 'Location is required',
    }),
  status: Joi.string()
    .valid('pending', 'assigned', 'done')
    .default('pending'),
  cost: Joi.number().required().min(0).messages({
    'number.min': 'Cost must be a positive number',
    'any.required': 'Cost is required',
  }),
});

// Trip validation schema
const tripSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'Trip ID cannot be empty',
    'any.required': 'Trip ID is required',
  }),
  vehicleId: Joi.string().required().messages({
    'string.empty': 'Vehicle ID cannot be empty',
    'any.required': 'Vehicle ID is required',
  }),
  driverId: Joi.string().required().messages({
    'string.empty': 'Driver ID cannot be empty',
    'any.required': 'Driver ID is required',
  }),
  order1Id: Joi.string().required().messages({
    'string.empty': 'Order 1 ID cannot be empty',
    'any.required': 'Order 1 ID is required',
  }),
  order2Id: Joi.string().allow(null).optional(),
  route: Joi.object({
    stopA: Joi.string().required().messages({
      'any.required': 'Route stopA is required',
    }),
    stopB: Joi.string().required().messages({
      'any.required': 'Route stopB is required',
    }),
  })
    .required()
    .messages({
      'any.required': 'Route is required',
    }),
  status: Joi.string()
    .valid('planned', 'running', 'completed')
    .default('planned'),
  cost: Joi.number().required().min(0).messages({
    'number.min': 'Cost must be a positive number',
    'any.required': 'Cost is required',
  }),
});

// Validation middleware factory
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    return res.status(400).json({ errors: messages });
  }

  req.body = value;
  next();
};

module.exports = {
  validateVehicle: validate(vehicleSchema),
  validateDriver: validate(driverSchema),
  validateOrder: validate(orderSchema),
  validateTrip: validate(tripSchema),
};
