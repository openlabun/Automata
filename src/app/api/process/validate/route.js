export async function POST(req) {
    try {
        const { regex } = await req.json();

        if (!regex) {
            return new Response(JSON.stringify({ error: 'Missing expression' }), { status: 400 });
        }

        const payload = { expression: regex };

        const response = await fetch('https://proyectosingenieria.uninorte.edu.co/automatoncraft/api/validate/', {
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
