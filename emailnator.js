class Emailnator {
    #baseUrl = 'https://emailnator.com';
    #headers = {
        'accept': 'application/json',
        'content-type': 'application/json',
        'origin': 'https://emailnator.com',
        'referer': 'https://emailnator.com/',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36',
    };

    static GMAIL_IDS = Object.freeze([2, 3, 8]);
    static FREE_IDS = Object.freeze([1, 2, 3, 8]);

    async request(endpoint, options = {}) {
        const fetch = (await import('node-fetch')).default;
        const res = await fetch(`${this.#baseUrl}${endpoint}`, {
            ...options,
            headers: { ...this.#headers, ...options.headers },
        });
        const text = await res.text();
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
        return JSON.parse(text);
    }

    async generateEmail(ids = Emailnator.FREE_IDS) {
        return this.request('/api/generate-email', {
            method: 'POST',
            body: JSON.stringify({ ids }),
        });
    }

    async listMessages(email, limit = 20) {
        return this.request('/api/message-list', {
            method: 'POST',
            body: JSON.stringify({ email, limit }),
        });
    }

    async getMessage(messageId) {
        return this.request(`/api/message/${encodeURIComponent(messageId)}`, {
            method: 'GET',
        });
    }
}

module.exports = Emailnator;
