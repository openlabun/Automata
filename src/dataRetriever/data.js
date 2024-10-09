export async function handleAutomatonProcess(regex, method, inputString) {
    try {
        
        // Step 1: Validate the regular expression via your API
        const validateResponse = await fetch('/api/process/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ regex }),
        });

        const validateData = await validateResponse.json();

        if (!validateResponse.ok || !validateData.postfix) {
            throw new Error('Invalid regular expression.');
        }

        const { postfix, symbols } = validateData;

        // Step 2: Execute the selected method (Thompson, Subset, Optimize) via your API
        let methodEndpoint = `/api/process/${method}`;
        const automatonResponse = await fetch(methodEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ postfix, symbols }),
        });

        const automatonData = await automatonResponse.json();
        if (!automatonResponse.ok) {
            throw new Error(`Error while executing ${method} method.`);
        }

        const {
            transition_table,
            TranD,
            States,
            initial_state,
            accept_states,
        } = automatonData;

        // Step 4: Return all the relevant data
        return {
            transition_table,
            symbols,
            TranD,
            States,
            initial_state,
            accept_states,
        };

    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function handleAutomatonEvaluate(method, string) {

    try {
        const response = await fetch('/api/process/evaluate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputString: string,
                method: method,
            }),
        });

        const evaluationData = await response.json();

        if (!response.ok) {
            throw new Error('Error evaluating the input string.');
        }

        return {
            status: evaluationData.status,
            paths: evaluationData.paths,
        };

    } catch (error) {
        console.error(error);
        return null; 
    }
}
