mapboxgl.accessToken ='pk.eyJ1IjoiZHAtMDAiLCJhIjoiY2w0Ym9ueHJmMHI4ODNsbzc0b3J3czNuaCJ9.by1QhjBnFJlaJ83YTh4p3Q';

const mapbox = new mapboxgl.Map({
    container: 'mapbox',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [11, 60],
    zoom: 5.5,
    pitch: 45
});

mapbox.on('load', async () => {
    mapbox.resize();

    const response = await fetch(
        'https://dp-00.github.io/js/roadtrip.geojson'
    );
    const data = await response.json();
    const coordinates = data.features[0].geometry.coordinates;
        
    const responsePhoto = await fetch(
        'https://dp-00.github.io/js/roadtripPhotos.geojson'
    );  
    const photo = await responsePhoto.json();

    const geojson = {
        "type":"FeatureCollection",
        "features":[]
    };

    for (let i=0; i< photo.features.length; i++){
        var snapped = turf.nearestPointOnLine(data, photo.features[i]);
        geojson.features.push(
            { "type": "Feature",
            "geometry": {"type": "Point","coordinates": [snapped.geometry.coordinates]},
            "properties": {"name": photo.features[i].properties.name ,"path": photo.features[i].properties.path, "coords": photo.features[i].geometry.coordinates} });
    }
        
    data.features[0].geometry.coordinates = [coordinates[0]];

    mapbox.addSource('trace', {
        type: 'geojson',
        data: data,
        lineMetrics: true
    });

    mapbox.addLayer({
        'id': 'trace',
        'type': 'line',
        'source': 'trace',
        'paint': {
            'line-color': 'red',
            'line-opacity': 1,
            'line-width': 8,
            'line-gradient': [
                'interpolate',
                ['linear'],
                ['line-progress'],
                0,
                'grey',
                1,
                'darkred'
            ]
        }
    });


                    
    let photoContainer = document.getElementById('photo-container');
    let mapPhoto = document.getElementById('map-photo');
    let photoTitle = document.getElementById('photo-title');
    let photoCoordsLng = document.getElementById('lng');
    let photoCoordsLat = document.getElementById('lat');
    let distance = document.getElementById('km');
    
    let i = 0;
    let srcPath = 'images/roadtrip/';

    const timer = setInterval(() => {
        if (i < coordinates.length) {
            data.features[0].geometry.coordinates.push(coordinates[i]);
            mapbox.getSource('trace').setData(data);

            distance.innerText = Math.round(turf.length(data)) + "km";

            let lng = (Math.round(data.features[0].geometry.coordinates[i][0] * 100))/100;
            let lat = (Math.round(data.features[0].geometry.coordinates[i][1] * 100))/100;
            photoCoordsLng.innerText = lng;
            photoCoordsLat.innerText = lat;

            for (let j=0; j < geojson.features.length; j++){
                
                if(JSON.stringify(coordinates[i])===JSON.stringify(geojson.features[j].geometry.coordinates[0])){
                
                    photoContainer.style.display="inline";
                    photoName = geojson.features[j].properties.name;
                    photoPath = geojson.features[j].properties.path;
                    mapPhoto.src= srcPath + photoPath;
                    photoTitle.innerText = photoName;


                    const marker = new mapboxgl.Marker({
                        color: "#5e0101",
                        scale: 1.5
                    }).setLngLat(geojson.features[j].properties.coords)
                    .setPopup(new mapboxgl.Popup({maxWidth:'none'})
                    .setHTML("<p id='popup-header'>"+ photoName + "</p><img width='400px' src="+ srcPath + photoPath+ ">")) 
                    .addTo(mapbox);
                }               
            }

            i++;

        } 
        else {
            window.clearInterval(timer);
        }

    }, 4);

});
