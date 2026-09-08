const normalizeText = (value = "") =>
    value.trim().toLowerCase().replace(/\s+/g, " ");

const locationAliases = {
    "nanded, india": "Nanded-Waghala",
};

const pickBestMatch = (location, country, results = []) => {
    const targetLocation = normalizeText(location);
    const targetCountry = normalizeText(country);

    return results
        .map((result, index) => {
            const name = normalizeText(result.name || "");
            const displayName = normalizeText(result.display_name || "");
            const addressType = normalizeText(result.addresstype || result.type || "");
            const countryMatch = !targetCountry || displayName.includes(targetCountry);

            const matchesCityName =
                name === targetLocation ||
                displayName.startsWith(`${targetLocation},`) ||
                displayName.includes(`${targetLocation},`);

            const isCityLevelPlace = [
                "city",
                "town",
                "village",
                "municipality",
                "hamlet",
                "suburb",
                "borough",
            ].includes(addressType);

            let score = 0;
            if (matchesCityName) score += 40;
            if (isCityLevelPlace) score += 20;
            if (countryMatch) score += 10;
            if (result.type === "administrative") score += 5;

            return { result, score, index };
        })
        .sort((a, b) => b.score - a.score || a.index - b.index)[0]?.result;
};

const geocodeLocation = async (location, country) => {
    if (!location || !country) {
        return null;
    }

    const queryLocation =
        locationAliases[`${normalizeText(location)}, ${normalizeText(country)}`] ||
        location;
    const query = new URLSearchParams({
        q: `${queryLocation}, ${country}`,
        format: "jsonv2",
        limit: "5",
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

        const results = await response.json();
        const result = pickBestMatch(queryLocation, country, results);

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
