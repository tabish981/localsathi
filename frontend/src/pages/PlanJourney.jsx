import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { MdTrain, MdDirectionsSubway } from "react-icons/md";
import "../styles/planJourney.css";

const GOOGLE_KEY = "AIzaSyBOXYLhLbF6Y4pGHdmVv8tRaxAxL0v5e1E";

function loadGoogle() {
  return new Promise((resolve) => {
    if (window.google?.maps?.places) {
      resolve(window.google);
      return;
    }
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places,geometry`;
    s.async = true;
    s.onload = () => resolve(window.google);
    document.body.appendChild(s);
  });
}

export default function PlanJourney() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const fromRef = useRef(null);
  const toRef = useRef(null);
  const mapRef = useRef(null);

  const [googleApi, setGoogleApi] = useState(null);
  const [map, setMap] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);

  const [fromLoc, setFromLoc] = useState(null);
  const [toLoc, setToLoc] = useState(null);
  const [distance, setDistance] = useState(0);
  const [searched, setSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [results, setResults] = useState({});
  const [transitRoutes, setTransitRoutes] = useState([]);
  const [numTravelers, setNumTravelers] = useState(1);
  const [mustVisitPlaces, setMustVisitPlaces] = useState([]);

  useEffect(() => {
    loadGoogle().then((google) => {
      setGoogleApi(google);
      const m = new google.maps.Map(mapRef.current, {
        center: { lat: 19.076, lng: 72.8777 },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
      });
      setMap(m);

      const renderer = new google.maps.DirectionsRenderer();
      renderer.setMap(m);
      setDirectionsRenderer(renderer);

      const fromAuto = new google.maps.places.Autocomplete(fromRef.current);
      fromAuto.addListener("place_changed", () => {
        const p = fromAuto.getPlace();
        if (p?.geometry) setFromLoc(p.geometry.location);
      });

      const toAuto = new google.maps.places.Autocomplete(toRef.current);
      toAuto.addListener("place_changed", () => {
        const p = toAuto.getPlace();
        if (p?.geometry) setToLoc(p.geometry.location);
      });

      if (location.state?.from && location.state?.to) {
        fromRef.current.value = location.state.from;
        toRef.current.value = location.state.to;

        const geocoder = new google.maps.Geocoder();
        const geocodePromises = [
          geocoder.geocode({ address: location.state.from }),
          geocoder.geocode({ address: location.state.to })
        ];

        Promise.all(geocodePromises).then(([fromRes, toRes]) => {
          if (fromRes.results[0]?.geometry?.location && toRes.results[0]?.geometry?.location) {
            setFromLoc(fromRes.results[0].geometry.location);
            setToLoc(toRes.results[0].geometry.location);
          }
        });
      }
    });
  }, [googleApi, location.state]);

  useEffect(() => {
    if (googleApi && fromLoc && toLoc && location.state?.from && !searched) {
      searchJourney();
    }
  }, [fromLoc, toLoc, googleApi, location.state]);

  const calculateTrainFare = (d, serviceName = "") => {
    const name = (serviceName || "").toLowerCase();
    const isMetro = name.includes("metro") || name.includes("line 1") || name.includes("line 2") || name.includes("line 7");

    if (isMetro) {
      if (d <= 3) return 10;
      if (d <= 12) return 20;
      if (d <= 18) return 30;
      if (d <= 24) return 40;
      if (d <= 30) return 50;
      if (d <= 36) return 60;
      return 70;
    }

    if (d <= 10) return 5;
    if (d <= 25) return 10;
    if (d <= 45) return 15;
    if (d <= 65) return 20;
    if (d <= 85) return 25;
    if (d <= 105) return 30;
    if (d <= 125) return 35;
    return 40;
  };

  const busFare = (d) => {
    if (d <= 5) return 5;
    if (d <= 10) return 10;
    if (d <= 15) return 15;
    if (d <= 20) return 20;
    if (d <= 25) return 25;
    return 30;
  };

  const taxiFare = (d) => {
    if (d <= 1.5) return 28;
    let fare = 28 + (d - 1.5) * 18.66;
    return Math.ceil(fare);
  };

  const fetchMustVisitPlacesAlongRoute = async (path) => {
    if (!googleApi || !map || !path || path.length === 0) return;
    const service = new googleApi.maps.places.PlacesService(map);
    
    // Pick 3 points along the route
    const points = [];
    if (path.length > 5) {
      points.push(path[Math.floor(path.length * 0.25)]);
      points.push(path[Math.floor(path.length * 0.50)]);
      points.push(path[Math.floor(path.length * 0.75)]);
    } else {
      points.push(path[Math.floor(path.length / 2)]);
    }

    let allPlaces = [];
    let seenPlaces = new Set();
    
    for (const pt of points) {
      await new Promise((resolve) => {
        service.nearbySearch(
          { location: pt, radius: 5000, keyword: 'tourist attraction famous places to visit' },
          (res, status) => {
            if (status === googleApi.maps.places.PlacesServiceStatus.OK && res) {
              res.forEach(place => {
                if (!seenPlaces.has(place.place_id)) {
                  seenPlaces.add(place.place_id);
                  allPlaces.push(place);
                }
              });
            } else {
              console.warn("LocalSathi Places API Warning:", status);
            }
            // Delay significantly to prevent OVER_QUERY_LIMIT from multiple requests
            setTimeout(resolve, 450);
          }
        );
      });
    }
    
    allPlaces.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    setMustVisitPlaces(allPlaces.slice(0, 8));
  };

  const mapNavigation = (mode, isInitialSearch = false) => {
    if (!googleApi || !directionsRenderer || !fromLoc || !toLoc) return;

    const travelModeMapping = {
      Train: googleApi.maps.TravelMode.TRANSIT,
      Bus: googleApi.maps.TravelMode.TRANSIT,
      Walk: googleApi.maps.TravelMode.WALKING,
      Taxi: googleApi.maps.TravelMode.DRIVING,
      Cab: googleApi.maps.TravelMode.DRIVING,
    };

    const directionsService = new googleApi.maps.DirectionsService();

    const routeOptions = {
      origin: fromLoc,
      destination: toLoc,
      travelMode: travelModeMapping[mode] || googleApi.maps.TravelMode.DRIVING,
    };

    if (mode === "Train") {
      routeOptions.transitOptions = {
        modes: [googleApi.maps.TransitMode.SUBWAY, googleApi.maps.TransitMode.TRAIN, googleApi.maps.TransitMode.RAIL],
        routingPreference: googleApi.maps.TransitRoutePreference.FEWER_TRANSFERS
      };
      routeOptions.provideRouteAlternatives = true;
    } else if (mode === "Bus") {
      routeOptions.transitOptions = {
        modes: [googleApi.maps.TransitMode.BUS]
      };
    }

    directionsService.route(routeOptions, (result, status) => {
      if (status === googleApi.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);
        
        if (isInitialSearch && result.routes[0]?.overview_path) {
          fetchMustVisitPlacesAlongRoute(result.routes[0].overview_path);
        }

        const leg = result.routes[0].legs[0];
        const realDist = leg.distance.value / 1000;
        const realTime = leg.duration.value / 60;
        setDistance(realDist);

        if (mode === "Train") {
          const processedRoutes = [];
          const seenRoutes = new Set();

          result.routes.forEach((r, idx) => {
            const l = r.legs[0];
            let trainDist = 0;
            let serviceNames = [];
            let isMetro = false;
            let routeSteps = [];

            l.steps.forEach(s => {
              if (s.travel_mode === "TRANSIT" && s.transit_details) {
                const td = s.transit_details;
                const type = td.line?.vehicle?.type || "";
                if (type === "HEAVY_RAIL" || type === "SUBWAY" || type === "COMMUTER_TRAIN" || type === "TRAM" || td.line?.name?.toLowerCase().includes("train") || td.line?.name?.toLowerCase().includes("metro")) {
                  trainDist += s.distance.value / 1000;
                  const sName = td.line?.short_name || td.line?.name || "Local Train";
                  serviceNames.push(sName);
                  if (sName.toLowerCase().includes("metro") || sName.toLowerCase().includes("line 1") || sName.toLowerCase().includes("line 2") || sName.toLowerCase().includes("line 7")) {
                    isMetro = true;
                  }
                  routeSteps.push(`🚆 Board ${sName} from ${td.departure_stop.name} to ${td.arrival_stop.name}`);
                } else {
                  routeSteps.push(`🚌 Take ${td.line?.short_name || td.line?.name || 'Bus'} from ${td.departure_stop.name}`);
                }
              } else if (s.travel_mode === "WALKING") {
                routeSteps.push(`🚶 ${s.instructions.replace(/<[^>]*>?/gm, '')}`);
              }
            });

            if (serviceNames.length === 0) return;

            const serviceNameStr = [...new Set(serviceNames)].join(" + ");
            const totalDist = l.distance.value / 1000;
            const time = l.duration.value / 60;
            const routeKey = `${serviceNameStr}-${Math.round(time)}`;

            const calculatedCost = calculateTrainFare(trainDist > 0 ? trainDist : totalDist, serviceNameStr);

            if (!seenRoutes.has(routeKey)) {
              seenRoutes.add(routeKey);
              processedRoutes.push({
                id: idx,
                serviceName: serviceNameStr,
                distance: totalDist,
                time: time,
                cost: calculatedCost,
                instructions: routeSteps.join("  ➔  "),
                isMetro: isMetro
              });
            }
          });

          setTransitRoutes(processedRoutes);
          if (processedRoutes.length > 0) {
            setResults(prev => ({
              ...prev,
              Train: { ...prev.Train, cost: processedRoutes[0].cost, time: processedRoutes[0].time, serviceName: processedRoutes[0].serviceName }
            }));
          }
        } else {
          setResults(prev => {
            let newCost = 0;
            if (mode === "Bus") newCost = busFare(realDist);
            else if (mode === "Taxi") newCost = taxiFare(realDist);
            else if (mode === "Cab") newCost = Math.ceil(80 + realDist * 18);
            else if (mode === "Walk") newCost = 0;

            return { ...prev, [mode]: { ...prev[mode], cost: newCost, time: realTime } };
          });
        }
      }
    });
  };

  const searchJourney = () => {
    if (!fromLoc || !toLoc) {
      alert(t("select_locations") || "Select From and To locations");
      return;
    }
    setSearched(false);
    setIsSearching(true);

    setTimeout(() => {
      const d = googleApi.maps.geometry.spherical.computeDistanceBetween(fromLoc, toLoc) / 1000;
      setDistance(d);
      setSearched(true);
      setIsSearching(false);
      const initialResults = {
      Train: { time: (d / 35) * 60, cost: calculateTrainFare(d), serviceName: "Calculating..." },
      Bus: { time: (d / 20) * 60, cost: busFare(d) },
      Walk: { time: (d / 5) * 60, cost: 0 },
      Taxi: { time: (d / 25) * 60, cost: taxiFare(d) },
      Cab: { time: (d / 30) * 60, cost: Math.ceil(80 + d * 18) }
    };
    setResults(initialResults);
    setTransitRoutes([]);
    const firstMode = Object.keys(initialResults)[0];
    setSelectedMode(firstMode);
    mapNavigation(firstMode, true);

    const userId = localStorage.getItem("userId");
    if (userId) {
      fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          from: fromRef.current?.value || "Unknown",
          to: toRef.current?.value || "Unknown",
          mode: firstMode,
          distance: d.toFixed(2),
          cost: initialResults[firstMode].cost.toString()
        })
      }).catch(err => console.error("Error saving trip:", err));
    }
    }, 1500);
  };

  const handleModeSelection = (mode) => {
    setSelectedMode(mode);
    mapNavigation(mode);
  };

  const fastestOption = () => {
    const fastest = Object.entries(results).sort((a, b) => a[1].time - b[1].time)[0][0];
    handleModeSelection(fastest);
  };

  const getUberLink = () => {
    if (!fromLoc || !toLoc) return "#";
    return `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${fromLoc.lat()}&pickup[longitude]=${fromLoc.lng()}&dropoff[latitude]=${toLoc.lat()}&dropoff[longitude]=${toLoc.lng()}`;
  };

  const getOlaLink = () => {
    if (!fromLoc || !toLoc) return "https://book.olacabs.com";
    return `https://book.olacabs.com/?pickup_lat=${fromLoc.lat()}&pickup_lng=${fromLoc.lng()}&drop_lat=${toLoc.lat()}&drop_lng=${toLoc.lng()}`;
  };

  const getRapidoLink = () => "https://www.rapido.bike/";

  return (
    <div className="plan-dashboard">
      <div className="plan-header-nav">
        <button onClick={() => navigate(-1)} className="back-arrow">←</button>
        <h3 className="plan-nav-title">{t("plan_journey")}</h3>
        <div className="header-spacer"></div>
      </div>

      <div className="plan-main-container">
        <div className={`plan-sidebar ${searched || isSearching ? "searched" : "compact"}`}>
          <div className="plan-card">
            <div className="search-header">
              <h3>{t("route_details")}</h3>
              <div className="input-group">
                <input ref={fromRef} placeholder={t("enter_source")} className="plan-input" />
                <input ref={toRef} placeholder={t("enter_destination")} className="plan-input" />
              </div>
              <button className={`search-btn ${isSearching ? "loading" : ""}`} onClick={searchJourney} disabled={isSearching}>
                {isSearching ? <span className="btn-loader-text">Analyzing...</span> : (t("search_journey") || "Search Journey")}
              </button>
            </div>
          </div>
        </div>

        {searched && (
          <div className="results-sidebar expanded">
            <div className="plan-card">
              <div className="results-scroll-area">
                <button className="fastest-btn" onClick={fastestOption}>⚡ {t("fastest_option")}</button>

                <div className="transport-scroll">
                  {Object.keys(results).map((mode) => (
                    <div
                      key={mode}
                      className={`transport-card ${selectedMode === mode ? "active" : ""}`}
                      onClick={() => handleModeSelection(mode)}
                    >
                      {t(mode.toLowerCase()) || mode}
                    </div>
                  ))}
                </div>

                {selectedMode && results[selectedMode] && (() => {
                  const travelBaseCost = results[selectedMode].cost || 0;
                  const travelTime = results[selectedMode].time || 0;
                  const isVehicleBased = selectedMode === "Cab" || selectedMode === "Taxi";
                  const travelMultiplier = isVehicleBased ? Math.ceil(numTravelers / 4) : numTravelers;
                  const totalLevelCost = travelBaseCost * travelMultiplier;
                  
                  let mealRate = travelTime > 180 ? 600 : travelTime > 90 ? 350 : travelTime > 30 ? 180 : 50;
                  const totalFoodCost = mealRate * numTravelers;
                  const contingency = Math.ceil((totalLevelCost + totalFoodCost) * 0.1);
                  const totalBudget = totalLevelCost + totalFoodCost + contingency;

                  return (
                    <div className="budget-estimator-card premium-glass">
                      <div className="budget-header">
                        <div className="header-left">
                          <span className="budget-glow-icon">💰</span>
                          <div className="budget-title-group">
                            <h4>Smart Budget Guide</h4>
                            <span className="duration-pill">{Math.ceil(travelTime)} min journey</span>
                          </div>
                        </div>
                        <div className="traveler-stepper">
                          <button onClick={() => setNumTravelers(Math.max(1, numTravelers - 1))}>−</button>
                          <span className="count-num">{numTravelers}</span>
                          <button onClick={() => setNumTravelers(numTravelers + 1)}>+</button>
                        </div>
                      </div>
                      <div className="budget-main-grid">
                        <div className="budget-item-v2">
                          <span className="item-label">Travel</span>
                          <span className="item-price">₹{totalLevelCost}</span>
                        </div>
                        <div className="budget-item-v2">
                          <span className="item-label">Food</span>
                          <span className="item-price">₹{totalFoodCost}</span>
                        </div>
                        <div className="budget-item-v2">
                          <span className="item-label">Safety</span>
                          <span className="item-price">₹{contingency}</span>
                        </div>
                      </div>
                      <div className="budget-footer-total">
                        <span className="grand-total-label">Total Estimate</span>
                        <span className="final-amount">₹{totalBudget}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="result-list">
                  {Object.entries(results)
                    .filter(([m]) => !selectedMode || m === selectedMode)
                    .map(([mode, d]) => (
                      <div key={mode} className={`result-card ${selectedMode === mode ? "selected-highlight" : ""}`} onClick={() => handleModeSelection(mode)}>
                        <div className="result-main">
                          <h4>{t(mode.toLowerCase()) || mode}</h4>
                          <span className="price">₹{d.cost}</span>
                        </div>
                        <div className="result-meta">
                          <span>{distance.toFixed(2)} km</span>
                          <span>{Math.ceil(d.time)} min</span>
                        </div>

                        {mode === "Cab" && selectedMode === "Cab" && (
                          <div className="cab-action-buttons">
                            <a className="book-uber-btn" href={getUberLink()} target="_blank" rel="noopener noreferrer">Book Uber</a>
                            <a className="book-ola-btn" href={getOlaLink()} target="_blank" rel="noopener noreferrer">Ola Cabs</a>
                          </div>
                        )}
                        {mode === "Taxi" && selectedMode === "Taxi" && (
                          <div className="cab-action-buttons">
                            <a className="book-rapido-btn" href={getRapidoLink()} target="_blank" rel="noopener noreferrer">Rapido Bike</a>
                          </div>
                        )}
                      </div>
                    ))}

                  {selectedMode === "Train" && transitRoutes.length > 0 && (
                    <div className="transit-options-list">
                      <h4 className="options-title">Available Train Routes</h4>
                      {transitRoutes.map((route, i) => (
                        <div key={i} className="transit-route-card">
                          <div className="route-header">
                             <div className="route-name-wrapper">
                               {route.isMetro ? <MdDirectionsSubway /> : <MdTrain />}
                               <span className="route-name">{route.serviceName}</span>
                             </div>
                             <span className="route-price">₹{route.cost}</span>
                          </div>
                          <p className="route-path">{route.instructions}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {mustVisitPlaces.length > 0 && (
                    <div className="must-visit-section">
                      <h4 className="must-visit-title">✨ Places to Visit On The Way</h4>
                      <div className="must-visit-scroll">
                        {mustVisitPlaces.map((place, idx) => (
                          <div key={idx} className="must-visit-card" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${place.geometry.location.lat()},${place.geometry.location.lng()}`, '_blank')}>
                            {place.photos && place.photos.length > 0 ? (
                              <img src={place.photos[0].getUrl({ maxWidth: 200, maxHeight: 150 })} alt={place.name} className="must-visit-img" />
                            ) : (
                              <div className="must-visit-img-placeholder">🗺️</div>
                            )}
                            <div className="must-visit-info">
                              <span className="must-visit-name">{place.name}</span>
                              <span className="must-visit-rating">⭐ {place.rating || "New"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        )}

        <div className="plan-map-view">
          <div className="map-card-wrapper pos-relative">
            {isSearching && (
              <div className="radar-overlay">
                <div className="radar-ring"></div>
                <div className="radar-ring delay"></div>
                <p className="radar-text">Analyzing satellite & traffic data...</p>
              </div>
            )}
            <div ref={mapRef} className="map-container"></div>
          </div>
        </div>
      </div>
    </div>
  );
}