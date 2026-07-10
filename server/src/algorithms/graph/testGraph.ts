import mongoose from 'mongoose';
import { GraphBuilder } from './builder';
import { EdgeType } from './types';

async function runTest() {
  console.log('\x1b[36m[Test] Initializing Railway Graph Construction Test...\x1b[0m');
  
  const startTime = Date.now();
  
  // 1. Build the graph
  const builder = new GraphBuilder({
    minTransferTime: 20,  // Minimum layover of 20 minutes
    maxTransferTime: 1440 // Maximum layover of 24 hours
  });
  
  const graph = await builder.build();
  const buildDuration = Date.now() - startTime;
  
  console.log(`\n\x1b[32m[Test] Graph built successfully in ${buildDuration}ms.\x1b[0m\n`);

  // 2. Compute metrics
  const totalNodes = graph.getNodesCount();
  const travelEdges = graph.getEdgesCount(EdgeType.TRAVEL);
  const transferEdges = graph.getEdgesCount(EdgeType.TRANSFER);
  const totalEdges = travelEdges + transferEdges;
  const averageDegree = totalNodes > 0 ? totalEdges / totalNodes : 0;

  // 3. Compute top 10 stations with most transfer opportunities
  const stationTransferMap = new Map<string, { code: string; name: string; city: string; count: number }>();

  const allNodes = graph.getAllNodes();
  for (const node of allNodes) {
    const neighbors = graph.getNeighbors(node.nodeId);
    
    // Count TRANSFER edges from this node
    let nodeTransferCount = 0;
    for (let i = 0; i < neighbors.length; i++) {
      if (neighbors[i].type === EdgeType.TRANSFER) {
        nodeTransferCount++;
      }
    }

    if (nodeTransferCount > 0) {
      const stationKey = node.stationId;
      const current = stationTransferMap.get(stationKey) || {
        code: node.stationCode,
        name: node.stationName,
        city: '', // will be empty or not needed, or we can format station info
        count: 0
      };
      current.count += nodeTransferCount;
      stationTransferMap.set(stationKey, current);
    }
  }

  const sortedStations = Array.from(stationTransferMap.values()).sort((a, b) => b.count - a.count);

  // 4. Output metrics
  console.log('==================================================');
  console.log('             RAILWAY GRAPH METRICS REPORT         ');
  console.log('==================================================');
  console.log(`Total Nodes             : ${totalNodes}`);
  console.log(`Travel Edges            : ${travelEdges}`);
  console.log(`Transfer Edges          : ${transferEdges}`);
  console.log(`Total Edges             : ${totalEdges}`);
  console.log(`Average Degree          : ${averageDegree.toFixed(4)}`);
  console.log('--------------------------------------------------');
  console.log('Top 10 Stations with Most Transfer Opportunities:');
  
  const limit = Math.min(10, sortedStations.length);
  for (let idx = 0; idx < limit; idx++) {
    const s = sortedStations[idx];
    console.log(` [${idx + 1}] ${s.name} (${s.code}) -> ${s.count} transfer edges`);
  }
  console.log('==================================================\n');

  // Disconnect from database cleanly
  await mongoose.disconnect();
}

runTest().catch(async (error) => {
  console.error('\x1b[31m[Test Error] Graph testing script failed:\x1b[0m', error);
  try {
    await mongoose.disconnect();
  } catch (err) {
    // Silent
  }
  process.exit(1);
});
