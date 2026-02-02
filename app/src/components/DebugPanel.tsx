import React from 'react';

interface DebugPanelProps {
  onTriggerAlert: () => void;
  onTriggerSignalLoss: () => void;
  onTriggerOrders: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ onTriggerAlert, onTriggerSignalLoss, onTriggerOrders }) => {
  return (
    <div style={{ position: 'fixed', bottom: '10px', right: '10px', background: 'white', padding: '10px', border: '1px solid #ccc' }}>
      <h3>Debug Panel</h3>
      <button onClick={onTriggerAlert}>触发温泉越界告警</button>
      <button onClick={onTriggerSignalLoss}>哈巴错信号丢失</button>
      <button onClick={onTriggerOrders}>巴松措订单爆发</button>
    </div>
  );
};

export default DebugPanel;