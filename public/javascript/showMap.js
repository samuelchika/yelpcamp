mapboxgl.accessToken = mapBoxToken;
const map = new mapboxgl.Map({
  container: "map",
  // Replace YOUR_STYLE_URL with your style URL.
  style: "mapbox://styles/examples/cjgiiz9ck002j2ss5zur1vjji",
  center: campground.geometry.coordinates,
  zoom: 10.7
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

var marker = new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({
      offset: 25
    }).setHTML(`<h3>${campground.title}</h3>`)
  )
  .addTo(map);
