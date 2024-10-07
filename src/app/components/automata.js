import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import dagre from 'cytoscape-dagre';
import styles from "./component.module.css";
import styles2 from "/src/app/page.module.css";

cytoscape.use(dagre);

const Automata = ({ nfaTable, method, initial_state, accept_states }) => {


  const cyContainer = useRef(null);
  const cyRef = useRef(null); 
  const [stringToEvaluate, setStringToEvaluate] = useState("");
  const [triggerAnimation, setTriggerAnimation] = useState(false); // Trigger the animation when the 'evaluar' button is clicked
  const [isAnimating, setIsAnimating] = useState(false); // Animation status
  const [isDisabled, setIsDisabled] = useState(true); // Disable input and button while animating
  const [accepted, setAccepted] = useState(null); // Accepted status of the string
  const [paths, setPaths] = useState([]);
  const [abortController, setAbortController] = useState(null); 

  console.log('is animating', isAnimating);
  console.log('is disabled', isDisabled);


  const handleStringInputChange = (event) => {
    setStringToEvaluate(event.target.value);
    setAccepted(null);
  };

  const handleCancel = () => {
    if (abortController) {
      abortController.abort(); 
    }
    setIsAnimating(false);
    setIsDisabled(false);
    setAccepted(null);
    setPaths([]); 
    cyRef.current.elements().removeClass("highlighted"); 
  };

  const evaluate = async () => {
    try {
        const response = await fetch("/api/process/evaluate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputString: stringToEvaluate,
                method,
            }),
        });

        const data = await response.json();
        console.log('data enviada', data); 

        if (response.ok) {
            return {
                status: data.status.trim() === "Aceptada", 
                paths: Array.isArray(data.paths) ? data.paths : JSON.parse(data.paths),
            };
        } else {
            console.error("Error response:", data);
            return {
                status: false,
                paths: [],     
            };
        }

    } catch (error) {
        console.error("Error processing the regular expression.", error);
        return {
            status: false, 
            paths: [],     
        };
    }
};

const handleSubmit = async (event) => {
  event.preventDefault();

  console.log('metodo', method);
  console.log('string', stringToEvaluate);

  const { status, paths } = await evaluate();

  console.log('status', status); 
  console.log('paths', paths);   

  setAccepted(status);
  setPaths(paths);
  setTriggerAnimation(prev => !prev); 
  setIsAnimating(true);
  setIsDisabled(true);
  
  console.log('Updated status', accepted); 
  console.log('triggerAnimation', triggerAnimation); 
};


  useEffect(() => {

    if (!nfaTable) {
      setAccepted(null); 
      //abort ongoing animation
      if (abortController) {
        abortController.abort();
      }
      setIsDisabled(true);
      setIsAnimating(false);
      //clear the inputs value
      setStringToEvaluate("");
      return
    };

    const elements = [];
    const visitedNodes = new Set();
    let firstState = null;
    setIsDisabled(false);

    if(method === "thompson") {

      Object.keys(nfaTable).forEach((state, index) => {
        if (state == initial_state && firstState == null) {
          firstState = state;
          elements.push({ data: { id: "start", label: "Start" }, classes: "start" });
          elements.push({
            data: { source: "start", target: state, label: "" },
          });
        }

        if (!visitedNodes.has(state)) {
          const classes = state === accept_states ? "final" : ""; 
          elements.push({ data: { id: state, label: state }, classes });  
          visitedNodes.add(state);
      }

        Object.entries(nfaTable[state]).forEach(([transition, targets]) => {
          targets.forEach((target) => {
            elements.push({
              data: { source: state, target: target.toString(), label: transition },
            });

            if (!visitedNodes.has(target)) {

              const classes = target === accept_states ? "final" : ""; // Clase para el estado final

              elements.push({ data: { id: target.toString(), label: target.toString() }, classes });  
              visitedNodes.add(target);
            }
          });
        });
      });
    
    } else {

      nfaTable.forEach(transitionStr => {

        const match = transitionStr.match(/(\w+):\(\s*(.*?)\s*,\s*(\w+)\s*\)/);

        if (match) {
            const state = match[1];      // The state (e.g., "A")
            const transition = match[2];  // The transition symbol (e.g., "a")
            const target = match[3];      // The target state (e.g., "B")
    
            if (initial_state.includes(state) && firstState === null) {
                firstState = state;
                elements.push({ data: { id: "start", label: "Start" }, classes: "start" });
                elements.push({
                    data: { source: "start", target: state, label: "" },
                });
            }
    
            if (!visitedNodes.has(state)) {
                const classes = accept_states.includes(state) ? "final" : "";  
                elements.push({ data: { id: state, label: state }, classes }); 
                visitedNodes.add(state);
            }
    
            elements.push({
                data: { source: state, target: target, label: transition },
            });
    
            if (!visitedNodes.has(target)) {
                const classes = accept_states.includes(target) ? "final" : "";  
                elements.push({ data: { id: target, label: target }, classes });  
                visitedNodes.add(target);
            }
        }
    });
    
      
    }

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
              "border-color": "#00ff00",    
              "background-color": "transparent", 
              "shape": "ellipse",             
          },
      },
        {
          selector: ".highlighted", 
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

    cyRef.current = cy; 

    return () => cy.destroy();
  }, [nfaTable]);

  useEffect(() => {
    const animatePath = async () => {
      if (!cyRef.current || paths.length === 0) return;
  
      const controller = new AbortController();
      setAbortController(controller); 
  
      try {
        cyRef.current.elements().removeClass("highlighted");
  
        const pathToAnimate = accepted ? paths.filter(p => p.aceptado)[0]?.camino : paths.map(p => p.camino).flat();
  
        if (!pathToAnimate) return; 
  
        // Highlight the start node
        cyRef.current.$("#start").addClass("highlighted");
  
        let animationAborted = false; // Flag to check if animation was aborted
  
        for (let i = 0; i < pathToAnimate.length - 1; i++) {
          if (controller.signal.aborted) {
            animationAborted = true; // Set the flag if aborted
            throw new Error("Animation aborted");
          }
  
          const currentState = pathToAnimate[i];
          const nextState = pathToAnimate[i + 1];
  
          const currentNode = cyRef.current.$(`#${currentState}`);
          const edge = cyRef.current.edges(`[source = "${currentState}"][target = "${nextState}"]`);
  
          currentNode.addClass("highlighted");
          edge.addClass("highlighted");
  
          await new Promise(resolve => setTimeout(resolve, 1000));
  
          currentNode.removeClass("highlighted");
          edge.removeClass("highlighted");
        }
  
        // Only highlight the final node if the animation was not aborted
        if (!animationAborted) {
          const finalNode = cyRef.current.$(`#${pathToAnimate[pathToAnimate.length - 1]}`);
          finalNode.addClass("highlighted");
  
          // Delay to keep the final node highlighted for a bit
          await new Promise(resolve => setTimeout(resolve, 1000));
  
          finalNode.removeClass("highlighted");
        }
  
      } catch (error) {
        if (error.message !== "Animation aborted") {
          console.error(error);
        }
      } finally {
        setIsAnimating(false);
        setAccepted(null);
        setAbortController(null);
        setIsDisabled(false);
      }
    };
  
    if (isAnimating) {
      animatePath();
    }
  }, [triggerAnimation]);
  
  return (
    <div className={styles.automatacontainer}>
      <div className={styles.infoContainer}>
        <div className={styles2.inputContainer}>
          <input
            type="text"
            className={`${styles.input} ${isDisabled ? styles.disabled : ''}`} 
            id="regex"
            name="regex"
            placeholder="Ingrese cadena a evaluar..."
            autoComplete="off"
            value={stringToEvaluate} 
            onChange={handleStringInputChange}
            disabled={isDisabled} 
          />
          <input
            className={`${styles.buttonsubmit} ${isDisabled ? styles.disabled : ''}`} 
            value="Evaluar"
            type="submit"
            onClick={handleSubmit}
            disabled={isDisabled} 
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
      {isAnimating && (
        <button onClick={handleCancel} className={styles.cancelButton}>
          Cancelar Evaluación
        </button>
      )}
    </div>
  );
};

export default Automata;
