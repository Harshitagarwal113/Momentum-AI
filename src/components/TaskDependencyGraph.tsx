import React from "react";
import { Layers, AlertCircle, CheckCircle2, Play } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: "completed" | "in_progress" | "pending";
  priority: "high" | "medium" | "low";
  dependencies?: string[];
  risk_score?: number;
}

interface GraphProps {
  tasksList: Task[];
  onSelectTask?: (task: Task) => void;
  activeTaskId?: string | null;
}

export default function TaskDependencyGraph({ tasksList, onSelectTask, activeTaskId }: GraphProps) {
  if (!tasksList || tasksList.length === 0) {
    return (
      <div className="text-center py-8 border border-neutral-800/40 rounded-xl bg-neutral-900/10 font-mono text-xs text-neutral-500">
        No active tasks configured to construct dependency graph.
      </div>
    );
  }

  // Calculate coordinates for hierarchical layout
  const layers: Record<string, number> = {};
  
  const getLayer = (taskId: string, visited = new Set<string>()): number => {
    if (taskId in layers) return layers[taskId];
    if (visited.has(taskId)) return 0; // Prevent infinite cycle
    visited.add(taskId);

    const task = tasksList.find((t) => t.id === taskId);
    if (!task || !task.dependencies || task.dependencies.length === 0) {
      layers[taskId] = 0;
      return 0;
    }

    let maxDepLevel = 0;
    for (const depId of task.dependencies) {
      maxDepLevel = Math.max(maxDepLevel, getLayer(depId, visited));
    }
    layers[taskId] = maxDepLevel + 1;
    return maxDepLevel + 1;
  };

  tasksList.forEach((t) => getLayer(t.id));

  // Group tasks by calculated layer
  const layerGroups: Record<number, string[]> = {};
  Object.entries(layers).forEach(([taskId, layerNum]) => {
    if (!layerGroups[layerNum]) layerGroups[layerNum] = [];
    layerGroups[layerNum].push(taskId);
  });

  const totalLayers = Object.keys(layerGroups).length;

  // Render Dimensions
  const canvasWidth = 800;
  const canvasHeight = 280;

  // Compute node coordinates
  const nodes: Record<string, { x: number; y: number; task: Task }> = {};
  
  Object.entries(layerGroups).forEach(([layerStr, taskIds]) => {
    const layerIdx = parseInt(layerStr);
    const x = totalLayers > 1 
      ? 80 + (layerIdx / (totalLayers - 1)) * (canvasWidth - 160)
      : canvasWidth / 2;

    const count = taskIds.length;
    taskIds.forEach((id, itemIdx) => {
      const task = tasksList.find((t) => t.id === id);
      if (!task) return;
      
      const y = count > 1
        ? 40 + (itemIdx / (count - 1)) * (canvasHeight - 80)
        : canvasHeight / 2;
      
      nodes[id] = { x, y, task };
    });
  });

  // Collect edges from dependencies
  const edges: { from: { x: number; y: number }; to: { x: number; y: number }; key: string; isCompleted: boolean }[] = [];
  tasksList.forEach((task) => {
    if (task.dependencies && task.dependencies.length > 0) {
      task.dependencies.forEach((depId) => {
        const fromNode = nodes[depId];
        const toNode = nodes[task.id];
        if (fromNode && toNode) {
          const isCompleted = fromNode.task.status === "completed" && toNode.task.status === "completed";
          edges.push({
            from: fromNode,
            to: toNode,
            key: `${depId}->${task.id}`,
            isCompleted,
          });
        }
      });
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-neutral-900/40 p-3 rounded-xl border border-neutral-800/60">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-neutral-200">Interactive Task Dependency Map</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-neutral-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Done
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-500" /> In Progress
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Pending
          </span>
        </div>
      </div>

      <div className="relative border border-neutral-900 bg-neutral-950 rounded-2xl p-4 overflow-x-auto selection:bg-transparent">
        <svg 
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} 
          className="w-full min-w-[700px] h-auto drop-shadow-md select-none"
        >
          {/* Gradients and markers definition */}
          <defs>
            <marker
              id="arrow-completed"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>
            <marker
              id="arrow-pending"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#404040" />
            </marker>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Draw connection paths (edges) */}
          {edges.map((edge) => {
            const { from, to, key, isCompleted } = edge;
            // Cubic bezier path for smooth curves
            const dx = Math.abs(to.x - from.x) * 0.5;
            const pathData = `M ${from.x} ${from.y} C ${from.x + dx} ${from.y}, ${to.x - dx} ${to.y}, ${to.x} ${to.y}`;
            
            return (
              <path
                key={key}
                d={pathData}
                fill="none"
                stroke={isCompleted ? "#10b981" : "#404040"}
                strokeWidth={isCompleted ? 2.5 : 1.5}
                strokeDasharray={isCompleted ? "none" : "4 3"}
                markerEnd={isCompleted ? "url(#arrow-completed)" : "url(#arrow-pending)"}
                className="transition-all duration-300"
              />
            );
          })}

          {/* Draw interactive task cards (nodes) */}
          {Object.entries(nodes).map(([id, node]) => {
            const { x, y, task } = node;
            const isSelected = activeTaskId === id;
            
            let color = "#3b82f6"; // Default blue
            let stroke = "#1d4ed8";
            let statusLabel = "In Progress";
            
            if (task.status === "completed") {
              color = "#10b981"; // Emerald
              stroke = "#047857";
              statusLabel = "Completed";
            } else if (task.status === "pending") {
              color = "#f59e0b"; // Amber
              stroke = "#b45309";
              statusLabel = "Pending";
            }

            return (
              <g 
                key={id}
                transform={`translate(${x}, ${y})`}
                onClick={() => onSelectTask?.(task)}
                className="cursor-pointer group"
              >
                {/* Glowing aura on hover or selection */}
                {(isSelected) && (
                  <rect
                    x="-65"
                    y="-25"
                    width="130"
                    height="50"
                    rx="10"
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    filter="url(#glow)"
                    className="opacity-70 transition-all duration-300"
                  />
                )}

                {/* Main Card container */}
                <rect
                  x="-60"
                  y="-20"
                  width="120"
                  height="40"
                  rx="8"
                  fill="#0a0a0a"
                  stroke={isSelected ? color : stroke}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="group-hover:stroke-emerald-400 transition-all duration-300 shadow-xl"
                />

                {/* Priority micro-indicator */}
                <rect
                  x="-55"
                  y="-14"
                  width="4"
                  height="28"
                  rx="2"
                  fill={task.priority === "high" ? "#ef4444" : task.priority === "medium" ? "#3b82f6" : "#10b981"}
                />

                {/* Task Title text */}
                <text
                  x="-42"
                  y="2"
                  fill="#f5f5f5"
                  fontSize="9.5"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  className="select-none truncate"
                >
                  {task.title.length > 16 ? task.title.substring(0, 14) + ".." : task.title}
                </text>

                {/* Status indicator subtitle */}
                <text
                  x="-42"
                  y="12"
                  fill={color}
                  fontSize="7.5"
                  fontFamily="monospace"
                  fontWeight="medium"
                  className="select-none uppercase tracking-wider"
                >
                  {statusLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
