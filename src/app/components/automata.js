import { useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);

const Automata = ({ nfaTable }) => {
  const cyContainer = useRef(null);

  useEffect(() => {
    if (!nfaTable) return; // Return if there's no NFA table data

    const elements = [];
    const visitedNodes = new Set();
    let firstState = null;

    // Convert nfaTable into nodes and edges for Cytoscape
    Object.keys(nfaTable).forEach((state, index) => {
      // Mark the first state as the start state
      if (index === 0) {
        firstState = state;
        elements.push({ data: { id: "start", label: "Start" }, classes: "start" }); // Start node
        elements.push({
          data: { source: "start", target: state, label: "*" }, // Start edge to first state
        });
      }

      if (!visitedNodes.has(state)) {
        elements.push({ data: { id: state } }); // Add the node
        visitedNodes.add(state);
      }

      Object.entries(nfaTable[state]).forEach(([transition, targets]) => {
        targets.forEach((target) => {
          elements.push({
            data: { source: state, target: target.toString(), label: transition },
          });
          if (!visitedNodes.has(target)) {
            elements.push({ data: { id: target.toString() } }); // Add the target node
            visitedNodes.add(target);
          }
        });
      });
    });

    /*const finalState = Object.keys(nfaTable).slice(-1)[0]; 
    const transitions = nfaTable[finalState]; 
    
    const largestNumber = Math.max(
      ...Object.values(transitions).flatMap((trans) => trans)
    );
    
    elements.forEach((element) => {
      if (element.data.id === largestNumber.toString()) {
        element.classes = "final"; 
      }
    });*/

    // Initialize Cytoscape
    const cy = cytoscape({
      container: cyContainer.current,
      elements: elements, // Use dynamically generated elements
      style: [
        {
          selector: "node",
          style: {
            "background-color": "transparent",
            label: "data(id)",
            "text-valign": "center",
            "text-halign": "center",
            "border-width": 2,
            "border-color": "#fff",
            "shape": "ellipse",
            "width": "40px",
            "height": "40px",
            "font-size": "15px",
            "text-outline-width": 2,
            "text-outline-color": "#fff",
          },
        },
        {
          selector: "edge",
          style: {
            width: 3,
            "line-color": "#fff",
            "target-arrow-color": "#fff",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            label: "data(label)", // Display the label (transition symbol)
            "font-size": "20px",
            "text-background-color": "transparent",
            "text-background-opacity": 0,
            "text-margin-y": -15,
            "text-border-width": 4,
            color: "#fff",
          },
        },
        {
          selector: ".start",
          style: {
            "background-color": "transparent", // Start state color
            "border-width": 0,                 // Remove border
            "shape": "roundrectangle",          // Keep the shape if needed
            "text-outline-width": 0,            // Remove text outline
            opacity: 0,                         // Make the node fully invisible
          },
        },
        {
          selector: ".final",
          style: {
            "border-width": 5, // Double border for the final state
            "border-color": "#fff",
          },
        },
      ],
      layout: {
        name: 'dagre',
        directed: true,
        padding: 10,
        fit: true,
        rankDir: 'LR',
        avoidOverlap: true,
      },
      zoom: 1, 
      minZoom: 0.5,
      maxZoom: 3,
      wheelSensitivity: 0.1, 
    });

    // Ensure the layout is applied and fits the viewport
    cy.on('layoutstop', () => {
      cy.fit(); // Adjust the graph to fit the viewport
    });
    

    // Clean up on unmount
    return () => cy.destroy();
  }, [nfaTable]); // Re-run the effect if nfaTable changes

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        ref={cyContainer}
        style={{ width: "100%", height: "100%", border: "2px solid lightgray" }}
      ></div>
    </div>
  );
};

export default Automata;
