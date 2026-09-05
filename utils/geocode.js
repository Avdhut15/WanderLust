const geocodeLocation = async (location, country) => {
    if (!location || !country) {
        return null;
    }

    const query = new URLSearchParams({
        q: `${location}, ${country}`,
        format: "jsonv2",
        limit: "1",
    });

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?${query}`,
            {
                headers: {
                    "User-Agent": "WanderLust/1.0 listing geocoder",
                },
            }
        );

        if (!response.ok) {
            return null;
        }

        const [result] = await response.json();
        if (!result) {
            return null;
        }

        return {
            type: "Point",
            coordinates: [Number(result.lon), Number(result.lat)],
        };
    } catch (error) {
        return null;
    }
};

module.exports = geocodeLocation;
