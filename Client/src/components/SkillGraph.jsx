// client/src/components/SkillGraph.jsx (FINAL CORRECTED VERSION)

import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

// Helper to format text for visual display (Title Case)
const formatNodeLabel = (label) => {
  // Handle the central goal node specifically (e.g., "GO DEVELOPER GOAL")
  if (label.includes(" GOAL")) {
    return label.replace(" GOAL", "");
  }
  // Simple Title Case for skills (ensuring clean display)
  const formatted = label.replace(/_/g, " ").toLowerCase();
  if (formatted.includes(" ")) {
    return formatted
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const SkillGraph = ({
  requiredSkills,
  userSkills,
  missingSkills,
  targetRole,
}) => {
  const svgRef = useRef();

  useEffect(() => {
    // Data passed here is ALREADY UPPERCASE
    if (!requiredSkills || requiredSkills.length === 0) return;

    // --- Data Preparation ---

    const normalizedRequired = requiredSkills;
    const normalizedUser = userSkills;
    const normalizedMissing = missingSkills;

    const allSkillsSet = new Set([...normalizedRequired, ...normalizedUser]);
    const allSkills = Array.from(allSkillsSet);

    // Map skills to nodes
    const nodes = allSkills.map((skill) => {
      const isMissing = normalizedMissing.includes(skill);
      const isUserSkill = normalizedUser.includes(skill);

      let group = 0; // Default (unused, required)
      if (isMissing) group = 2; // Missing (Red)
      else if (isUserSkill) group = 1; // User Has (Green)

      return {
        id: skill,
        group: group,
      };
    });

    // Add a central goal node
    const goalNodeId = targetRole.toUpperCase() + " GOAL";
    nodes.push({ id: goalNodeId, group: 3 });

    // Create links: connecting every required skill to the central goal
    const links = normalizedRequired.map((skill) => ({
      source: skill,
      target: goalNodeId,
      // Thicker link for missing skills emphasizes the gap
      value: normalizedMissing.includes(skill) ? 3 : 1,
    }));

    const finalNodes = Array.from(
      new Map(nodes.map((item) => [item.id, item])).values()
    );

    // 2. Setup D3 Area
    const width = 800;
    const height = 450;
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", [0, 0, width, height]);

    svg.selectAll("*").remove(); // Clear previous drawing

    // 3. Setup Force Simulation
    const simulation = d3
      .forceSimulation(finalNodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(150)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(20));

    // Color Scale
    const color = d3
      .scaleOrdinal()
      .domain([1, 2, 3])
      .range(["#10B981", "#EF4444", "#FCD34D"]);

    // 4. Draw Links
    const link = svg
      .append("g")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => d.value);

    // 5. Draw Nodes
    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("g")
      .data(finalNodes)
      .join("g")
      .call(drag(simulation));

    // Node Circles
    node
      .append("circle")
      .attr("r", (d) => (d.id === goalNodeId ? 18 : 12))
      .attr("fill", (d) => color(d.group));

    // Node Labels
    node
      .append("text")
      .attr("x", (d) => (d.id === goalNodeId ? 20 : 15))
      .attr("y", "0.31em")
      .style("font-size", (d) => (d.id === goalNodeId ? "14px" : "10px"))
      .text((d) => formatNodeLabel(d.id)) // Use the helper for clean text
      .attr("fill", "white")
      .attr("pointer-events", "none");

    // 6. Update Position on Tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });
  }, [requiredSkills, userSkills, missingSkills, targetRole]);

  // Drag definition (remains the same)
  const drag = (simulation) => {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };

  return (
    <div className="pt-4">
      <svg ref={svgRef} width="100%" height="450"></svg>
      <div className="flex justify-center gap-6 mt-4 text-sm text-slate-400">
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#10B981]"></div> User Skills
        </span>
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div> Missing
          Skills (Thick Link)
        </span>
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FCD34D]"></div> Target Goal
        </span>
      </div>
    </div>
  );
};

export default SkillGraph;
