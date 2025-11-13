export const formatAddress = (addr: string) => {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";
};

export const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString("vi-VN");
};
