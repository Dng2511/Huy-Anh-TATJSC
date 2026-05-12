import React from 'react';
import { Modal } from 'antd';

function useInlineRowEdit({
  containerRef,
  getInitialData,
  getRowId = (record) => record?._id,
  onSave,
  confirmSaveOutside,
  confirmSaveShortcut,
  ignoreOutsideClickSelectors = ['.ant-select-dropdown'],
}) {
  const [editingRowId, setEditingRowId] = React.useState(null);
  const [editedRowData, setEditedRowData] = React.useState({});
  const [originalRowData, setOriginalRowData] = React.useState({});

  const handleEnterEdit = React.useCallback(
    (record) => {
      const rowId = getRowId(record);
      if (!rowId) return;
      const original = getInitialData(record);
      setEditingRowId(rowId);
      setEditedRowData(original);
      setOriginalRowData(original);
    },
    [getInitialData, getRowId]
  );

  const handleCancel = React.useCallback(() => {
    setEditingRowId(null);
    setEditedRowData({});
    setOriginalRowData({});
  }, []);

  const isDirty = React.useCallback(() => {
    if (!editingRowId) return false;
    try {
      return JSON.stringify(editedRowData) !== JSON.stringify(originalRowData);
    } catch (error) {
      return true;
    }
  }, [editingRowId, editedRowData, originalRowData]);

  const handleSave = React.useCallback(async () => {
    if (!editingRowId) return;
    await onSave(editingRowId, editedRowData);
    setEditingRowId(null);
    setEditedRowData({});
    setOriginalRowData({});
  }, [editingRowId, editedRowData, onSave]);

  const createModalConfirm = React.useCallback((confirmFn) => {
    return new Promise((resolve) => {
      Modal.confirm({
        title: 'Xác nhận lưu thay đổi',
        content: confirmFn?.() || 'Bạn có muốn lưu thay đổi?',
        okText: 'Lưu',
        cancelText: 'Hủy',
        style: {
          top: 250,
        },
        onOk() {
          resolve(true);
        },
        onCancel() {
          resolve(false);
        },
      });
    });
  }, []);

  React.useEffect(() => {
    const onClick = (e) => {
      if (!editingRowId) return;

      if (
        e.target?.closest &&
        ignoreOutsideClickSelectors.some((selector) => e.target.closest(selector))
      ) {
        return;
      }

      const container = containerRef?.current;
      if (!container) return;

      const currentRow = container.querySelector(`[data-row-key="${editingRowId}"]`);
      if (currentRow && currentRow.contains(e.target)) return;

      if (!isDirty()) {
        handleCancel();
        return;
      }

      (async () => {
        const shouldSave = await createModalConfirm(confirmSaveOutside);
        if (shouldSave) {
          handleSave();
        } else {
          handleCancel();
        }
      })();
    };

    const onKeyDown = (e) => {
      if (!editingRowId) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!isDirty()) return;
        (async () => {
          const shouldSave = await createModalConfirm(confirmSaveShortcut);
          if (shouldSave) {
            handleSave();
          }
        })();
      }
    };

    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [
    containerRef,
    editingRowId,
    isDirty,
    handleCancel,
    handleSave,
    confirmSaveOutside,
    confirmSaveShortcut,
    ignoreOutsideClickSelectors,
    createModalConfirm,
  ]);

  return {
    editingRowId,
    editedRowData,
    originalRowData,
    setEditedRowData,
    setOriginalRowData,
    handleEnterEdit,
    handleCancel,
    handleSave,
    isDirty,
  };
}

export default useInlineRowEdit;