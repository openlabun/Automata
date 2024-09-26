export async function POST(req) {
        try {
        const { regex, string } = await req.json();
    
        if (!regex) {
            return new Response(JSON.stringify({ error: 'Missing regex' }), { status: 400 });
        }
    
        //POST request to the Flask API running in Docker
        const response = await fetch('http://localhost:5000/process', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ regex, string }),
        });
    
        const data = await response.json();
    
        if (!response.ok) {
            return new Response(JSON.stringify({ error: data.error }), { status: response.status });
        }
    
        return new Response(JSON.stringify(data), { status: 200 });
        } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
        }
}
