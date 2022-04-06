import { ethApiCall } from "./common";
import { NodeDetails } from "../types/api/responses";

export async function updateNodeInfo(url: string, client: string) {
  const userClient = client; // hack not sure why getting client directly breaks
  let nodeDetails: NodeDetails = {
    statusText: "error",
    nodeId: "",
    nodeName: "",
    enode: "",
    ip: "",
    blocks: -1,
    peers: -1,
    queuedTxns: -1,
    pendingTxns: -1,
  };

  try {
    const adminNodeInfo = await ethApiCall(url, "admin_nodeInfo");
    const ethBlockNumber = await ethApiCall(url, "eth_blockNumber");
    const netPeerCount = await ethApiCall(url, "net_peerCount");
    const txPoolStatus = await ethApiCall(
      url,
      userClient === "goquorum" ? "txpool_status" : "txpool_besuTransactions"
    );
    nodeDetails["statusText"] = adminNodeInfo.statusText;
    nodeDetails["nodeId"] = adminNodeInfo.data.result.id;
    nodeDetails["nodeName"] = adminNodeInfo.data.result.name;
    nodeDetails["enode"] = adminNodeInfo.data.result.enode;
    nodeDetails["ip"] = adminNodeInfo.data.result.ip;
    nodeDetails["blocks"] = parseInt(ethBlockNumber.data.result, 16);
    nodeDetails["peers"] = parseInt(netPeerCount.data.result, 16);
    const besuOrGoQTxns =
      userClient === "goquorum"
        ? parseInt(txPoolStatus.data.result.queued, 16)
        : txPoolStatus.data["result"];
    if (txPoolStatus.data.result === undefined) {
      console.log(
        "TXPOOL API method is not set for rpc-http-api and rpc-ws-api for Besu"
      );
    }
    nodeDetails["queuedTxns"] =
      userClient === "besu" ? besuOrGoQTxns.length : besuOrGoQTxns;
    nodeDetails["pendingTxns"] =
      userClient === "besu" ? besuOrGoQTxns.length : besuOrGoQTxns;
  } catch (e) {
    console.error(
      "Node is unreachable. Ensure ports are open and client is running!"
    );
    nodeDetails["statusText"] = "error";
    console.error(e);
  } finally {
    return nodeDetails;
  }
}