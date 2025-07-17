import { useState, useEffect } from "react";
import { healthAPI } from "@/services/api";

type ApiStatus = "loading" | "active" | "inactive";

export const useApiStatus = (interval: number = 30000) => {
  const [status, setStatus] = useState<ApiStatus>("loading");

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await healthAPI.checkStatus();
        if (response.status === 200 && response.data.status === "OK") {
          setStatus("active");
        } else {
          setStatus("inactive");
        }
      } catch (error) {
        setStatus("inactive");
      }
    };

    // Check immediately on mount
    checkStatus();

    // Then check periodically
    const intervalId = setInterval(checkStatus, interval);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [interval]);

  return status;
};