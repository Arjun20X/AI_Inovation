import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

// Graph component receives the skills data from the DashboardPage
const SkillGraph = ({
  requiredSkills,
  userSkills,
  missingSkills,
  targetRole,
}) => {
  const svgRef = useRef();

  // D3 relies on raw DOM manipulation, so we use useEffect
  useEffect(() => {
    if (!requiredSkills || requiredSkills.length === 0) return;

    // 1. Prepare Data for D3

    // Combine all skills and normalize their case for comparison
    const allSkillsSet = new Set([
      ...requiredSkills.map((s) => s.toUpperCase()),
      ...userSkills.map((s) => s.toUpperCase()),
    ]);
    const allSkills = Array.from(allSkillsSet);

    // Map skills to nodes
    const nodes = allSkills.map((skill) => {
      const isMissing = missingSkills.includes(skill);
      const isUserSkill = userSkills.includes(skill);

      let group = 0;
      if (isMissing) group = 2; // Missing (Red)
      else if (isUserSkill) group = 1; // User Has (Green)
      else group = 0; // Required but not identified (Grey/Blue)

      return {
        id: skill,
        group: group,
      };
    });

    // Add a central goal node
    const goalNodeId = targetRole.toUpperCase() + " GOAL";
    nodes.push({ id: goalNodeId, group: 3 });

    // Create links: connecting every required skill to the central goal
    const links = requiredSkills.map((skill) => ({
      source: skill.toUpperCase(),
      target: goalNodeId,
      // Thicker link for missing skills emphasizes the gap
      value: missingSkills.includes(skill) ? 3 : 1,
    }));

    // 2. Setup D3 Area
    const width = 800;
    const height = 400;
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", [0, 0, width, height]);

    svg.selectAll("*").remove(); // Clear previous drawing

    // 3. Setup Force Simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(150)
      ) // Longer links
      .force("charge", d3.forceManyBody().strength(-400)) // Stronger repulsion
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(20)); // Prevent overlap

    // Color Scale based on Group
    // 1: Green (User Has), 2: Red (Missing), 3: Yellow (Goal)
    const color = d3
      .scaleOrdinal()
      .domain([1, 2, 3])
      .range(["#10B981", "#EF4444", "#FCD34D"]);

    // 4. Draw Links
    const link = svg
      .append("g")
      .attr("stroke", "#94a3b8") // Slate color
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
      .data(nodes)
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
      .text((d) => d.id)
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

  // Drag behavior definition (allows user interaction)
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
    <div className="mt-6 bg-slate-800 p-6 rounded-xl border border-slate-700">
      <h3 className="text-xl font-semibold text-slate-200 mb-4">
        Dynamic Skill Relationship Map
      </h3>
      <svg ref={svgRef} width="100%" height="450"></svg>
      <div className="flex justify-center gap-6 mt-4 text-sm text-slate-400">
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#10B981]"></div> User Skills
        </span>
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div> Missing
          Skills
        </span>
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FCD34D]"></div> Target Goal
        </span>
      </div>
    </div>
  );
};

export default SkillGraph;