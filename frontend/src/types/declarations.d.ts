declare module 'expo-notifications' {
  export interface NotificationPermissionsStatus {
    status: 'granted' | 'denied' | 'undetermined';
    granted: boolean;
    canAskAgain: boolean;
  }

  export interface NotificationRequest {
    identifier: string;
    content: {
      title: string;
      body: string;
      data?: Record<string, any>;
    };
    trigger?: any;
  }

  export function requestPermissionsAsync(): Promise<NotificationPermissionsStatus>;
  export function getPermissionsAsync(): Promise<NotificationPermissionsStatus>;
  export function scheduleNotificationAsync(request: NotificationRequest): Promise<string>;
  export function cancelScheduledNotificationAsync(identifier: string): Promise<void>;
  export function getBadgeCountAsync(): Promise<number>;
  export function setBadgeCountAsync(count: number): Promise<void>;
  export function addNotificationReceivedListener(listener: (notification: any) => void): any;
  export function addNotificationResponseReceivedListener(listener: (response: any) => void): any;
}

declare module 'expo-device' {
  export function isDevice(): boolean;
  export function getDeviceNameAsync(): Promise<string>;
  export function getDeviceTypeAsync(): Promise<'UNKNOWN' | 'PHONE' | 'TABLET' | 'DESKTOP' | 'TV'>;
  export function getPlatformApiLevelAsync(): Promise<number | null>;
  export function getSystemVersionAsync(): Promise<string>;
  export function getSystemUptimeAsync(): Promise<number>;
  export function getTotalMemoryAsync(): Promise<number>;
  export function getUsedMemoryAsync(): Promise<number>;
  export function isRootedExperimentalAsync(): Promise<boolean>;
}

declare module 'expo-image-picker' {
  export interface ImagePickerResult {
    cancelled: boolean;
    uri?: string;
    width?: number;
    height?: number;
    type?: string;
    fileName?: string;
    fileSize?: number;
  }

  export interface ImagePickerOptions {
    mediaTypes?: 'All' | 'Videos' | 'Images';
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
    allowsMultipleSelection?: boolean;
    selectionLimit?: number;
    base64?: boolean;
    exif?: boolean;
  }

  export function launchImageLibraryAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
  export function launchCameraAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
}

declare module 'react-native-razorpay' {
  interface RazorpayOptions {
    description?: string;
    image?: string;
    currency: string;
    key: string;
    amount: number;
    name: string;
    order_id: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
    theme?: {
      color?: string;
    };
  }

  interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  interface RazorpayError {
    code: string;
    description: string;
  }
}
