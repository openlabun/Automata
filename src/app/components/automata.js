import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import dagre from 'cytoscape-dagre';
import styles from "./component.module.css";
import styles2 from "/src/app/page.module.css";

cytoscape.use(dagre);

const Automata = ({ nfaTable, regex }) => {

  const cyContainer = useRef(null);
  const [stringToEvaluate, setStringToEvaluate] = useState(""); // For evaluating input strings
  const [accepted, setAccepted] = useState(false);

  const handleStringInputChange = (event) => {
    setStringToEvaluate(event.target.value); // Update the string to evaluate
  };

  const handleSubmit = async (event) => {
    if (!regex) {
      return;
    }

    event.preventDefault();
    // Use regex passed as a prop here
    try {
      const response = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          regex: regex, // Pass the regex value
          string: stringToEvaluate, // Pass the string to evaluate
        }),
      });

      const data = await response.json();

      console.log(data);

      if (response.ok) {
        setAccepted(data.status);
      } else {
        console.error(data.status);
      }
    } catch (error) {
      console.error("Error processing the regular expression.", error);
    }
  };

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
    <div className={styles.automatacontainer}>

      <div className={styles.infoContainer}>
        <div className={styles2.inputContainer}>
          <input
            type="text"
            className={styles.input}
            id="regex"
            name="regex"
            placeholder="Ingrese cadena a evaluar..."
            autoComplete="off"
            onChange={handleStringInputChange}
          />
          <input
            className={styles.buttonsubmit}
            value="Evaluar"
            type="submit"
            onClick={handleSubmit}
          />
        </div>

        <div className={styles.acceptance}>
          <div className={styles.option}>
            <span className={styles.indicator}></span>
            <span className={styles.text} id="accepted">Aceptado</span>
          </div>
          <div className={styles.option}>
            <span className={styles.indicator}></span>
            <span className={styles.text} id="rejected">Rechazado</span>
          </div>
        </div>
      </div>
      
      <div
        ref={cyContainer}
        style={{ width: "100%", height: "100%"}}
      ></div>
    </div>
  );
};

export default Automata;


