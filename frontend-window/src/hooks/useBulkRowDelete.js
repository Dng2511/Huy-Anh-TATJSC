import React from 'react';
import { Modal } from 'antd';

function useBulkRowDelete({
    deleteItems,
    onDeleted,
    getEmptyMessage,
    getConfirmMessage,
    getErrorMessage,
    setLoading,
    confirmTitle = 'Xác nhận xóa',
    confirmOkText = 'Xóa',
    confirmCancelText = 'Hủy',
}) {
    const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

    const rowSelection = React.useMemo(
        () => ({
            selectedRowKeys,
            onChange: (newSelectedRowKeys) => {
                setSelectedRowKeys(newSelectedRowKeys);
            },
            hideSelectAll: true,
            preserveSelectedRowKeys: true,
        }),
        [selectedRowKeys],
    );

    const handleDeleteSelected = React.useCallback(async () => {
        if (selectedRowKeys.length === 0) {
            alert(getEmptyMessage());
            return false;
        }

        return new Promise((resolve) => {
            Modal.confirm({
                title: confirmTitle,
                content: getConfirmMessage(selectedRowKeys),
                okText: confirmOkText,
                cancelText: confirmCancelText,
                style: {
                    top: 250,
                }, onOk: async () => {
                    try {
                        setLoading?.(true);
                        await deleteItems(selectedRowKeys);
                        setSelectedRowKeys([]);
                        await onDeleted?.();
                        resolve(true);
                    } catch (error) {
                        console.error(getErrorMessage(), error);
                        alert(getErrorMessage());
                        resolve(false);
                    } finally {
                        setLoading?.(false);
                    }
                },
                onCancel() {
                    resolve(false);
                },
            });
        });
    }, [deleteItems, getConfirmMessage, getEmptyMessage, getErrorMessage, onDeleted, selectedRowKeys, confirmTitle, confirmOkText, confirmCancelText, setLoading]);

    return {
        selectedRowKeys,
        setSelectedRowKeys,
        rowSelection,
        handleDeleteSelected,
    };
}

export default useBulkRowDelete;