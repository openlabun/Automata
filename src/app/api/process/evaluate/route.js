export async function POST(req) {
    try {
        const {inputString, method } = await req.json();

        if (!inputString || !method) {
            return new Response(JSON.stringify({ error: 'Missing input string or method' }), { status: 400 });
        }

        const payload = {
            string: inputString,
            method: method,
        };

        const response = await fetch('http://127.0.0.1:8000/api/evaluate/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Error from Flask API:', data);
            return new Response(JSON.stringify({ error: data.error || 'Unknown error' }), { status: response.status });
        }

        console.log('Data from Flask API:', data);

        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}
