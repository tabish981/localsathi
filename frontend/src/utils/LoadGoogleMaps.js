export function loadGoogleMaps() {
  return new Promise((resolve) => {
    if (window.google) {
      resolve(window.google);
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyC5mdXu1jWkeZW2QABYNMi8PdYvelbf3kY";
    script.async = true;
    script.defer = true;

    script.onload = () => resolve(window.google);

    document.head.appendChild(script);
  });
}
