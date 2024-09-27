import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import dagre from 'cytoscape-dagre';
import styles from "./component.module.css";
import styles2 from "/src/app/page.module.css";

cytoscape.use(dagre);

const Automata = ({ nfaTable, regex }) => {

  const cyContainer = useRef(null);
  const cyRef = useRef(null); // Reference to the Cytoscape instance
  const [stringToEvaluate, setStringToEvaluate] = useState("");
  const [accepted, setAccepted] = useState(null);
  const [paths, setPaths] = useState([]);

  const handleStringInputChange = (event) => {
    setStringToEvaluate(event.target.value);
  };

  const handleSubmit = async (event) => {
    if (!regex) {
      return;
    }

    event.preventDefault();

    try {
      const response = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          regex: regex,
          string: stringToEvaluate,
        }),
      });

      const data = await response.json();
      console.log('response data', data);

      // Set the accepted status and the paths to be visualized
      setAccepted(data.status === "Aceptada");
      setPaths(JSON.parse(data.paths)); // Parse paths from the response
    } catch (error) {
      console.error("Error processing the regular expression.", error);
    }
  };

  useEffect(() => {

    if (!nfaTable) {
      setAccepted(null); 
      console.log('nfaTable', nfaTable);
      return
    };

    const elements = [];
    const visitedNodes = new Set();
    let firstState = null;

    // Convert nfaTable into nodes and edges for Cytoscape
    Object.keys(nfaTable).forEach((state, index) => {
      if (index === 0) {
        firstState = state;
        elements.push({ data: { id: "start", label: "Start" }, classes: "start" });
        elements.push({
          data: { source: "start", target: state, label: "" },
        });
      }

      if (!visitedNodes.has(state)) {
        elements.push({ data: { id: state } });
        visitedNodes.add(state);
      }

      Object.entries(nfaTable[state]).forEach(([transition, targets]) => {
        targets.forEach((target) => {
          elements.push({
            data: { source: state, target: target.toString(), label: transition },
          });
          if (!visitedNodes.has(target)) {
            elements.push({ data: { id: target.toString() } });
            visitedNodes.add(target);
          }
        });
      });
    });

    // Initialize Cytoscape
    const cy = cytoscape({
      container: cyContainer.current,
      elements: elements,
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
            label: "data(label)",
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
            "background-color": "transparent",
            "border-width": 0,
            "shape": "roundrectangle",
            "text-outline-width": 0,
            opacity: 0,
          },
        },
        {
          selector: ".final",
          style: {
            "border-width": 5,
            "border-color": "#fff",
          },
        },
        {
          selector: ".highlighted", // Style for highlighted nodes and edges
          style: {
            "background-color": "yellow",
            "line-color": "yellow",
            "target-arrow-color": "yellow",
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

    cy.on('layoutstop', () => {
      cy.fit();
    });

    cyRef.current = cy; // Store the Cytoscape instance in the ref

    // Clean up on unmount
    return () => cy.destroy();
  }, [nfaTable]);

  useEffect(() => {
    const animatePath = async () => {
      if (!cyRef.current || paths.length === 0) return;
  
      // Remove previous highlights
      cyRef.current.elements().removeClass("highlighted");
  
      // Determine which paths to animate
      const pathToAnimate = accepted ? paths.filter(p => p.aceptado)[0]?.camino : paths.map(p => p.camino).flat();
  
      if (!pathToAnimate) return; // No valid path to animate
  
      // Highlight the start node
      cyRef.current.$("#start").addClass("highlighted");
  
      for (let i = 0; i < pathToAnimate.length; i++) {
        const currentState = pathToAnimate[i];
        const node = cyRef.current.$(`#${currentState}`);
  
        // Highlight the current state
        node.addClass("highlighted");
  
        // Delay for the current highlight
        await new Promise(resolve => setTimeout(resolve, 1000));
  
        // Remove highlight from the current state before moving to the next one
        node.removeClass("highlighted");
      }
    }
  
    animatePath();
  }, [paths, accepted]);
  


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

        <div className={styles.acceptance}
            style={{
              borderColor: accepted === true ? 'green' : accepted === false ? 'red' : 'grey',
              boxShadow: accepted === true ? '0 0 10px green' : accepted === false ? '0 0 10px red' : '0 0 10px grey',
            }}>
          <div className={styles.option}>
            <span
              className={styles.indicator}
              style={{ backgroundColor: accepted === true ? 'green' : 'grey' }}
            ></span>
            <span className={styles.text} 
            id="accepted"
            style={{ color: accepted === true ? 'green' : 'grey' }}>Aceptado</span>
          </div>
          <div className={styles.option}>
            <span
              className={styles.indicator}
              style={{ backgroundColor: accepted === false ? 'red' : 'grey' }}
            ></span>
            <span className={styles.text} 
            id="rejected"
            style={{ color: accepted === false ? 'red' : 'grey' }}>Rechazado</span>
          </div>
        </div>
      </div>

      <div
        ref={cyContainer}
        style={{ width: "100%", height: "100%" }}
      ></div>
    </div>
  );
};

export default Automata;
