import { networkInterfaces, type NetworkInterfaceInfo } from "node:os";
import type { NextConfig } from "next";

/**
 * Адреса этого компьютера в локальной сети. В dev-режиме Next не оживляет страницу,
 * открытую не с localhost, пока адрес не разрешён. Считаем адреса на старте —
 * тогда телефон по Wi-Fi работает на любом компьютере без правки конфига.
 */
function localNetworkAddresses(): string[] {
  return Object.values(networkInterfaces())
    .flat()
    .filter((net): net is NetworkInterfaceInfo => net !== undefined && net.family === "IPv4" && !net.internal)
    .map((net) => net.address);
}

const nextConfig: NextConfig = {
  allowedDevOrigins: localNetworkAddresses(),
};

export default nextConfig;
