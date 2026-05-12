import { Button, Flex } from 'antd'

function BulkDeleteButton({ selectedRowKeys, onClick, label }) {
  return (
    <Flex justify="flex-start" align="flex-end" style={{ marginTop: -50 }}>
      <Button 
        danger 
        disabled={selectedRowKeys.length === 0}
        onClick={onClick}
      >
        {label} ({selectedRowKeys.length})
      </Button>
    </Flex>
  )
}

export default BulkDeleteButton
