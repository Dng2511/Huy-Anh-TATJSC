import { Modal } from 'antd'

function useConfirmDialog() {
  const confirm = (title, content, okText = 'Lưu', cancelText = 'Hủy') => {
    return new Promise((resolve) => {
      Modal.confirm({
        title,
        content,
        okText,
        cancelText,
        onOk() {
          resolve(true)
        },
        onCancel() {
          resolve(false)
        },
      })
    })
  }

  return { confirm }
}

export default useConfirmDialog
