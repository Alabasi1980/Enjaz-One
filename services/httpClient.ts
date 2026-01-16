
/**
 * @file httpClient.ts
 * @description Resilient HTTP Client with automatic retries and cancellation support.
 */

const getBaseUrl = () => {
  return (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
};

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * دالة مركزية لتنفيذ طلبات HTTP مع معالجة ذكية للأخطاء، دعم الإلغاء، وإعادة المحاولة التلقائية.
 */
const request = async <T>(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<T> => {
  const baseUrl = getBaseUrl();
  const token = localStorage.getItem('enjaz_session_token');
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // التعامل مع انتهاء الجلسة
      if (response.status === 401) {
         localStorage.removeItem('enjaz_session_token');
         localStorage.removeItem('enjaz_session_user');
         window.location.reload();
         throw new Error("AUTH_EXPIRED");
      }

      // معالجة تعارض البيانات (Optimistic Locking)
      if (response.status === 409) {
         throw new Error("CONFLICT_DETECTED");
      }

      // إعادة المحاولة في حال أخطاء السيرفر المؤقتة
      if (response.status >= 500 && retryCount < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        console.warn(`[HTTP] Server error ${response.status}. Retrying in ${delay}ms...`);
        await sleep(delay);
        return request<T>(endpoint, options, retryCount + 1);
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API_ERROR: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    if (error.name === 'AbortError') throw error;

    // إعادة المحاولة في حال انقطاع الاتصال الفيزيائي
    if ((error.message.includes('Failed to fetch') || error.name === 'TypeError') && retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      console.warn(`[HTTP] Network connection failed. Retrying in ${delay}ms...`);
      await sleep(delay);
      return request<T>(endpoint, options, retryCount + 1);
    }
    
    throw error;
  }
};

export const httpClient = {
  get: <T>(endpoint: string, signal?: AbortSignal) => request<T>(endpoint, { method: 'GET', signal }),
  post: <T>(endpoint: string, data: any, signal?: AbortSignal) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(data), signal }),
  put: <T>(endpoint: string, data: any, signal?: AbortSignal) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data), signal }),
  patch: <T>(endpoint: string, data: any, signal?: AbortSignal) => request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data), signal }),
  delete: <T>(endpoint: string, signal?: AbortSignal) => request<T>(endpoint, { method: 'DELETE', signal })
};
