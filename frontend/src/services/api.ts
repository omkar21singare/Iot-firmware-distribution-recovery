import axios from 'axios';
import type { 
  Device, Firmware, Deployment, TransferSession, 
  AdaptiveInputData, AdaptiveDecision, RollbackEvent, 
  AnalyticsSummary, SystemEvent, WorkerPoolStatus 
} from '../types';

const API_BASE_URL = '/api';

export const api = {
  // Auth
  login: async (username: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
    return response.data;
  },

  // Devices
  getDevices: async (status?: string): Promise<Device[]> => {
    const res = await axios.get(`${API_BASE_URL}/devices`, { params: { status } });
    return res.data;
  },

  getDeviceDetail: async (deviceId: string): Promise<Device> => {
    const res = await axios.get(`${API_BASE_URL}/devices/${deviceId}`);
    return res.data;
  },

  createDevice: async (deviceData: any): Promise<Device> => {
    const res = await axios.post(`${API_BASE_URL}/devices`, deviceData);
    return res.data;
  },

  updateTelemetry: async (deviceId: string, telemetry: any): Promise<Device> => {
    const res = await axios.post(`${API_BASE_URL}/devices/${deviceId}/telemetry`, telemetry);
    return res.data;
  },

  // Firmware
  getFirmwareList: async (): Promise<Firmware[]> => {
    const res = await axios.get(`${API_BASE_URL}/firmware`);
    return res.data;
  },

  uploadFirmware: async (formData: FormData): Promise<Firmware> => {
    const res = await axios.post(`${API_BASE_URL}/firmware/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // Deployments
  getDeployments: async (): Promise<Deployment[]> => {
    const res = await axios.get(`${API_BASE_URL}/deployments`);
    return res.data;
  },

  checkWizardCompatibility: async (firmwareId: number, targetDeviceIds: number[]) => {
    const res = await axios.post(`${API_BASE_URL}/deployments/wizard-check`, {
      firmware_id: firmwareId,
      target_device_ids: targetDeviceIds
    });
    return res.data;
  },

  createDeployment: async (deploymentData: any): Promise<Deployment> => {
    const res = await axios.post(`${API_BASE_URL}/deployments`, deploymentData);
    return res.data;
  },

  // Transfers
  getActiveTransfers: async (): Promise<TransferSession[]> => {
    const res = await axios.get(`${API_BASE_URL}/transfers/active`);
    return res.data;
  },

  getWorkerPoolStatus: async (): Promise<WorkerPoolStatus> => {
    const res = await axios.get(`${API_BASE_URL}/transfers/worker-pool`);
    return res.data;
  },

  resumeTransferBlock: async (sessionId: number, fromBlock: number) => {
    const res = await axios.post(`${API_BASE_URL}/transfers/${sessionId}/resume`, { from_block: fromBlock });
    return res.data;
  },

  // Adaptive Engine
  evaluateAdaptiveMode: async (inputData: AdaptiveInputData): Promise<AdaptiveDecision> => {
    const res = await axios.post(`${API_BASE_URL}/adaptive/evaluate`, inputData);
    return res.data;
  },

  // Recovery & Rollback
  getRollbackEvents: async (): Promise<RollbackEvent[]> => {
    const res = await axios.get(`${API_BASE_URL}/recovery/rollbacks`);
    return res.data;
  },

  triggerRollback: async (deviceId: number, reason?: string) => {
    const res = await axios.post(`${API_BASE_URL}/recovery/trigger-rollback/${deviceId}`, null, {
      params: { reason }
    });
    return res.data;
  },

  getSystemEvents: async (): Promise<SystemEvent[]> => {
    const res = await axios.get(`${API_BASE_URL}/recovery/events`);
    return res.data;
  },

  // Analytics
  getAnalyticsSummary: async (): Promise<AnalyticsSummary> => {
    const res = await axios.get(`${API_BASE_URL}/analytics/summary`);
    return res.data;
  },

  // Demo Simulation
  startDemoSimulation: async () => {
    const res = await axios.post(`${API_BASE_URL}/demo/start`);
    return res.data;
  },

  stopDemoSimulation: async () => {
    const res = await axios.post(`${API_BASE_URL}/demo/stop`);
    return res.data;
  },

  getDemoStatus: async () => {
    const res = await axios.get(`${API_BASE_URL}/demo/status`);
    return res.data;
  }
};
