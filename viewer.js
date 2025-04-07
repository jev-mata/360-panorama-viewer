
document.addEventListener("DOMContentLoaded", async function () {
    const viewer = document.getElementById("panorama");
    const titleHeader = document.getElementById("title");
    const panoramaText = document.getElementById("title-panorama");
    const destinationText = document.getElementById("title-destination");
    const thumbnailContainer = document.getElementById("thumbnail-container");
    let viewerOBJ;
    // Get destination ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const destinationId = urlParams.get("destination");

    let selectedIndex = 0;
    let destinationName = "";
    let selectedItem = {
        id: "",
        name: "",
        description: "",
        categories: [],
        tags: [],
        address: "",
        thumbnail: "",
        virtual_tour: []
    };



    async function fetchDestinations() {
        try {
            // const response = await fetch("https://cms.openisland.ph/api/get-destination"); // Adjust API endpoint
            const response = await fetch("https://api.openisland.ph/api/destinations"); // Adjust API endpoint
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    }
    init();
    async function init() {
        const destinations = await fetchDestinations();
        const foundItem = destinations.find(d => d.id == destinationId);
        // console.log(foundItem); 

        const destinationName = foundItem?.name || ''; // Safely access name 
        
        if (!destinationName) {
            console.log("destinationName is empty, calling showFallback()");
            showFallback("Invalid Destination");
            return;
        }
        
        // Dynamically set Open Graph meta tags
        document.querySelector('meta[property="og:title"]').setAttribute("content", foundItem.name);
        document.querySelector('meta[property="og:description"]').setAttribute("content", foundItem.description);
        document.querySelector('meta[property="og:image"]').setAttribute("content", foundItem.thumbnail);
        document.querySelector('meta[property="og:url"]').setAttribute("content", window.location.href);

        // Dynamically set Twitter Card meta tags
        document.querySelector('meta[name="twitter:title"]').setAttribute("content", foundItem.name);
        document.querySelector('meta[name="twitter:description"]').setAttribute("content", foundItem.description);
        document.querySelector('meta[name="twitter:image"]').setAttribute("content", foundItem.thumbnail);

        const tours = JSON.parse(foundItem.virtual_tour);

        const scenes = {};
        const _scenes = {};

        // Loop through all tours and create scenes dynamically
        tours.forEach((tour, index) => {
            const sceneKey = `${tour.title}${index}`; // Unique key for each scene
            _scenes[index] = `${tour.path}`;
            scenes[sceneKey] = {
                "title": tour.title,
                "hfov": 110,
                "pitch": -3,
                "yaw": 117,
                "type": "equirectangular",
                "panorama": encodeURI(tour.path), // Encode URL to prevent space issues
            };
        });
 
        // Create the viewer configuration 
        selectedItem = tours; 
        let url = _scenes[selectedIndex];
        const newUrl = url.slice(0, url.lastIndexOf('/')); 
        viewer.innerHTML = `<iframe id="tourIframe" type="text/html" src="` + newUrl + `/vtour/tour.html" width="100%" height="100%" allow="xr-spatial-tracking"></iframe>`;
        titleHeader.innerText = `${destinationName} 360 - Open Island`;

        const iframe = document.getElementById("tourIframe");
 
        // Detect if the iframe fails to load
        iframe.addEventListener("error", (event) => {
            console.error("Iframe failed to load:", event);
            showFallback('This URL is Under Maintenance');
        });

        destinationText.innerText = `${destinationName}`;
 

    }
    function showFallback(msg) {
        document.getElementById('msg').innerHTML=msg;
        fallbackTriggered = true;
        viewer.style.display = "none";
        destinationText.style.display = "none";
        panoramaText.style.display = "none";
        fallback.style.display = "block";
    }
}); 