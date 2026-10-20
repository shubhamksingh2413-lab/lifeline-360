

async function showSOS() {
    const confirmed = confirm(
        "EMERGENCY SOS\n\n" +
        "OK = 112 par call karein\n" +
        "Cancel = Emergency contacts ko location share karein"
    );

    if (confirmed) {
        window.location.href = "tel:112";
        return;
    }

    const shareContacts = confirm(
        "Kya aap apne trusted emergency contacts ko " +
        "current location share karna chahte hain?"
    );

    if (!shareContacts) return;

    if (!navigator.geolocation) {
        alert("Is device par location support nahi hai.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const mapLink =
                "https://www.google.com/maps?q=" +
                latitude + "," + longitude;

           const customMessage = prompt(
    "Emergency message likhein:",
    "EMERGENCY SOS! Mujhe help ki zarurat hai. Please meri help karein."
);

if (customMessage === null) return;

const message =
    customMessage.trim() +
    "\nMeri current location: " + mapLink;

            const { data: userData, error: userError } =
                await supabaseClient.auth.getUser();

            if (userError || !userData.user) {
                alert("Pehle login karein, taaki trusted contacts mil sakein.");
                return;
            }

            const { data: contacts, error } = await supabaseClient
                .from("trusted_contacts")
                .select("name, phone")
                .order("created_at", { ascending: false });

            if (error) {
                alert("Contacts load nahi hue: " + error.message);
                return;
            }

            if (!contacts || contacts.length === 0) {
                alert("Pehle Trusted Contacts add karein.");
                return;
            }

            const contactChoices = contacts
                .map(function (contact, index) {
                    return (index + 1) + ". " +
                        contact.name + " (" + contact.phone + ")";
                })
                .join("\n");

            const choice = prompt(
                "Kis contact ko SOS location bhejni hai?\n\n" +
                contactChoices +
                "\n\nContact ka number enter karein (1, 2, 3...)"
            );

            if (choice === null) return;

            const index = parseInt((choice || "").trim(), 10) - 1;

if (
    !/^\d+$/.test((choice || "").trim()) ||
    index < 0 ||
    index >= contacts.length
) {
    alert(
        "Invalid contact number. List mein diya gaya number enter karein, jaise 1 ya 2."
    );
    return;
}

            const phone = contacts[index].phone.replace(/[^\d+]/g, "");

            const smsLink =
                "sms:" + phone + "?body=" + encodeURIComponent(message);

            window.location.href = smsLink;
        },
        function () {
            alert(
                "Current location nahi mil payi. " +
                "Browser ki location permission allow karke dobara try karein."
            );
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}


function showHelp(type) {
    const message = document.getElementById("helpMessage");

    if (!message) {
        alert("Help section missing. Please check index.html.");
        return;
    }

    if (type === "medical") {
        message.innerHTML = `
            <div class="help-card">
                <h2>🩺 Medical Emergency Help</h2>
                <p class="help-number">Emergency Number: 112</p>
                <h3>What should you do?</h3>
                <ol>
                    <li>Check that the area is safe.</li>
                    <li>Call 112 for urgent emergency assistance.</li>
                    <li>Tell the responder your location and what happened.</li>
                    <li>Follow the emergency operator's instructions.</li>
                    <li>Do not give food or drink to an unconscious person.</li>
                </ol>
                <p class="help-warning">If the person is unconscious or not breathing normally, tell the emergency operator immediately.</p>
            </div>`;
    } else if (type === "accident") {
        message.innerHTML = `
            <div class="help-card">
                <h2>🚗 Road Accident Help</h2>
                <p class="help-number">Emergency Number: 112</p>
                <h3>What should you do?</h3>
                <ol>
                    <li>Stay away from moving traffic if safe to do so.</li>
                    <li>Call 112 if anyone is seriously injured or in danger.</li>
                    <li>Share the accident location with the responder.</li>
                    <li>Do not move a seriously injured person unless there is immediate danger.</li>
                    <li>Follow instructions from emergency responders.</li>
                </ol>
                <p class="help-warning">Do not put yourself in danger while helping others.</p>
            </div>`;
    } else if (type === "fire") {
        message.innerHTML = `
            <div class="help-card">
                <h2>🔥 Fire Emergency Help</h2>
                <p class="help-number">Emergency Number: 112</p>
                <h3>What should you do?</h3>
                <ol>
                    <li>Raise the alarm and leave the building immediately.</li>
                    <li>Use a safe exit or staircase. Never use an elevator.</li>
                    <li>Stay low if there is smoke and avoid breathing it in.</li>
                    <li>Once safely outside, call 112.</li>
                    <li>Do not re-enter until authorities say it is safe.</li>
                </ol>
                <p class="help-warning">Never risk your life to collect belongings or fight a large fire.</p>
            </div>`;
    }

    message.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


const contactForm = document.getElementById("contactForm");
const contactMessage = document.getElementById("contactMessage");

if (contactForm && typeof supabaseClient !== "undefined") {
    let contactList = document.getElementById("contactList");

    if (!contactList) {
        contactList = document.createElement("div");
        contactList.id = "contactList";
        contactForm.insertAdjacentElement("afterend", contactList);
    }

    async function loadContacts() {
        const { data: userData, error: userError } =
            await supabaseClient.auth.getUser();

        if (userError || !userData.user) {
            contactList.replaceChildren();
            return;
        }

        const { data, error } = await supabaseClient
            .from("trusted_contacts")
            .select("id, name, phone")
            .order("created_at", { ascending: false });

        if (error) {
            contactMessage.textContent =
                "Contacts load nahi hue: " + error.message;
            return;
        }

        contactList.replaceChildren();

        const heading = document.createElement("h3");
        heading.textContent = "Your Trusted Contacts";
        contactList.appendChild(heading);

        if (data.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.textContent = "Abhi koi contact add nahi hua.";
            contactList.appendChild(emptyMessage);
            return;
        }

        data.forEach(function (contact) {
            const item = document.createElement("div");
            item.className = "saved-contact";

            const details = document.createElement("p");
            details.textContent = contact.name + " — " + contact.phone;

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.textContent = "Remove";

            removeButton.addEventListener("click", async function () {
                const { error: deleteError } = await supabaseClient
                    .from("trusted_contacts")
                    .delete()
                    .eq("id", contact.id);

                if (deleteError) {
                    contactMessage.textContent =
                        "Contact remove nahi hua: " + deleteError.message;
                    return;
                }

                contactMessage.textContent = "Contact remove ho gaya.";
                loadContacts();
            });

            const shareButton = document.createElement("button");
shareButton.type = "button";
shareButton.textContent = "Share Location";

shareButton.addEventListener("click", function () {
    if (!navigator.geolocation) {
        contactMessage.textContent =
            "Is device par location support nahi hai.";
        return;
    }

    contactMessage.textContent = "Location detect ho rahi hai...";

    navigator.geolocation.getCurrentPosition(
        function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const mapLink =
                "https://www.google.com/maps?q=" +
                latitude + "," + longitude;

            const message =
                "Emergency: Mujhe help ki zarurat ho sakti hai. " +
                "Meri current location: " + mapLink;

            const phone = contact.phone.replace(/[^\d+]/g, "");

            const smsLink =
                "sms:" + phone + "?body=" + encodeURIComponent(message);

            contactMessage.textContent =
                "SMS app kholne ki koshish ho rahi hai...";

            window.location.href = smsLink;
        },
        function (error) {
            contactMessage.textContent =
                "Location nahi mil payi. Browser ki location permission check karo.";
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
});

item.append(details, shareButton, removeButton);
            contactList.appendChild(item);
        });
    }

    contactForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("contactName").value.trim();
        const phone = document.getElementById("contactPhone").value.trim();

        if (!name || !phone) {
            contactMessage.textContent =
                "Contact ka naam aur phone number bharo.";
            return;
        }

        const { data: userData, error: userError } =
            await supabaseClient.auth.getUser();

        if (userError || !userData.user) {
            contactMessage.textContent =
                "Pehle Login karo, phir contact add karna.";
            return;
        }

        const { error } = await supabaseClient
            .from("trusted_contacts")
            .insert({
                user_id: userData.user.id,
                name: name,
                phone: phone
            });

        if (error) {
            contactMessage.textContent =
                "Contact save nahi hua: " + error.message;
            return;
        }

        contactMessage.textContent = "Contact database mein save ho gaya!";
        contactForm.reset();
        await loadContacts();
    });

    supabaseClient.auth.onAuthStateChange(function () {
        loadContacts();
    });

    loadContacts();
}


const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authMessage = document.getElementById("authMessage");


const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");

if (forgotPasswordBtn && typeof supabaseClient !== "undefined") {
    forgotPasswordBtn.addEventListener("click", async function () {
        const email = authEmail.value.trim();

        if (!email) {
            authMessage.textContent =
                "Pehle apni registered email address bharo.";
            authEmail.focus();
            return;
        }

        forgotPasswordBtn.disabled = true;
        authMessage.textContent = "Password reset email bheji ja rahi hai...";

        try {
            const { error } = await supabaseClient.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo: window.location.origin
                }
            );

            if (error) {
                authMessage.textContent =
                    "Reset email nahi bheji ja saki: " + error.message;
            } else {
                authMessage.textContent =
                    "Agar is email par account hai, to password reset link bhej diya gaya hai. Inbox aur spam folder check karein.";
            }
        } catch (error) {
            authMessage.textContent =
                "Kuch galat hua. Internet check karke dobara try karein.";
        } finally {
            forgotPasswordBtn.disabled = false;
        }
    });
}


if (
    typeof supabaseClient !== "undefined" &&
    signupBtn &&
    loginBtn &&
    logoutBtn &&
    authMessage
) {
    signupBtn.addEventListener("click", async function () {
        const email = authEmail.value.trim();
        const password = authPassword.value;

        if (!email || !password) {
            authMessage.textContent = "Email aur password bharo.";
            return;
        }

        authMessage.textContent = "Account ban raha hai...";

        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password
        });

        if (error) {
            authMessage.textContent = "Error: " + error.message;
            return;
        }

        if (data.session) {
            authMessage.textContent =
                "Account ban gaya! Tum login ho chuke ho.";
        } else {
            authMessage.textContent =
                "Account request successful! Email check karo aur confirmation link par click karo, agar maanga jaye.";
        }
    });

    loginBtn.addEventListener("click", async function () {
        const email = authEmail.value.trim();
        const password = authPassword.value;

        if (!email || !password) {
            authMessage.textContent = "Email aur password bharo.";
            return;
        }

        authMessage.textContent = "Login ho raha hai...";

        const { error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) {
            authMessage.textContent = "Login error: " + error.message;
        } else {
            authMessage.textContent = "Login successful! Welcome to LifeLine 360.";
        }
    });

    logoutBtn.addEventListener("click", async function () {
        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            authMessage.textContent = "Logout error: " + error.message;
        } else {
            authMessage.textContent = "Tum logout ho gaye ho.";
        }
    });

    supabaseClient.auth.onAuthStateChange(function (event, session) {
        logoutBtn.hidden = !session;
    });
} else {
    console.error(
        "Supabase setup ya account form check karo."
    );
}

const authModalEl = document.getElementById("authModal");
const openAuthBtn = document.getElementById("openAuthBtn");
const closeAuthBtn = document.getElementById("closeAuthBtn");
const authBoxEl = document.querySelector("#authModal .auth-box");
const authAccountSection = document.getElementById("account");
const authTitleEl = document.getElementById("authTitle");
const authSubtitleEl = document.getElementById("authSubtitle");
const loginTabBtn = document.getElementById("showLoginBtn");
const signupTabBtn = document.getElementById("showSignupBtn");
const authStatusEl = document.getElementById("authMessage");
const unusedModalMessage = document.getElementById("authModalMessage");

let currentAuthSession = null;

if (
    authModalEl && openAuthBtn && closeAuthBtn &&
    authBoxEl && authForm && authStatusEl &&
    loginTabBtn && signupTabBtn
) {
    // Move the existing form into the popup without removing its IDs.
    authBoxEl.appendChild(authForm);
    authBoxEl.appendChild(authStatusEl);

    if (unusedModalMessage) {
        unusedModalMessage.hidden = true;
    }

    // Hide the old form section; the form now lives in the popup.
    if (authAccountSection) {
        authAccountSection.hidden = true;
    }

    function setAuthMode(mode) {
        if (currentAuthSession) {
            signupBtn.hidden = true;
            loginBtn.hidden = true;
            authTitleEl.textContent = "Your LifeLine 360 Account";
            authSubtitleEl.textContent =
                "You are logged in. You can log out below.";
            return;
        }

        const isSignup = mode === "signup";

        signupBtn.hidden = !isSignup;
        loginBtn.hidden = isSignup;

        authTitleEl.textContent = isSignup
            ? "Create Your Account"
            : "Welcome Back";

        authSubtitleEl.textContent = isSignup
            ? "Create an account to manage your trusted contacts."
            : "Login to manage your trusted contacts.";

        authStatusEl.textContent = "";
    }

    function openAuthModal() {
        authModalEl.hidden = false;
        document.body.classList.add("auth-open");
        setAuthMode(currentAuthSession ? "login" : "login");
    }

    function closeAuthModal() {
        authModalEl.hidden = true;
        document.body.classList.remove("auth-open");
    }

    openAuthBtn.addEventListener("click", openAuthModal);
    closeAuthBtn.addEventListener("click", closeAuthModal);

    loginTabBtn.addEventListener("click", function () {
        setAuthMode("login");
    });

    signupTabBtn.addEventListener("click", function () {
        setAuthMode("signup");
    });

    authModalEl.addEventListener("click", function (event) {
        if (event.target === authModalEl) {
            closeAuthModal();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !authModalEl.hidden) {
            closeAuthModal();
        }
    });

    supabaseClient.auth.onAuthStateChange(function (event, session) {
        currentAuthSession = session;

        openAuthBtn.textContent = session
            ? "My Account"
            : "Login / Sign Up";

        if (session) {
            authStatusEl.textContent =
                "Logged in as " + session.user.email;
            setAuthMode("login");
        } else {
            setAuthMode("login");
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const mapElement = document.getElementById("locationMap");

    // Agar map section page par nahi hai, toh kuch mat karo.
    if (!mapElement || typeof L === "undefined") return;

    const status = document.getElementById("locationStatus");
    const coordinates = document.getElementById("coordinates");
    const detectBtn = document.getElementById("detectLocationBtn");
    const shareBtn = document.getElementById("shareLocationBtn");

    // Shuru mein poore India ka map dikhayenge.
    window.lifeLineMap = L.map("locationMap").setView(
    [22.9734, 78.6569],
    5
);
const map = window.lifeLineMap;

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let userMarker = null;
    let currentLocationLink = "";

    detectBtn.addEventListener("click", function () {
        if (!navigator.geolocation) {
            status.textContent =
                "Aapka browser location detect nahi kar sakta.";
            return;
        }

        status.textContent =
            "Location detect ho rahi hai. Permission allow karein...";
        detectBtn.disabled = true;

        navigator.geolocation.getCurrentPosition(
            function (position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                if (userMarker) {
                    map.removeLayer(userMarker);
                }

                userMarker = L.marker([lat, lng])
                    .addTo(map)
                    .bindPopup("Your Current Location")
                    .openPopup();

                map.setView([lat, lng], 16);

                coordinates.textContent =
                    "Latitude: " + lat.toFixed(6) +
                    " | Longitude: " + lng.toFixed(6);

                currentLocationLink =
                    "https://www.google.com/maps?q=" + lat + "," + lng;

                shareBtn.disabled = false;
                status.textContent = "Location successfully detected!";
                detectBtn.disabled = false;
            },
            function (error) {
                const messages = {
                    1: "Location permission nahi mili. Browser settings mein allow karein.",
                    2: "Location abhi available nahi hai. Dobara try karein.",
                    3: "Location request timeout hui. Dobara try karein."
                };

                status.textContent =
                    messages[error.code] || "Location detect nahi ho payi.";

                detectBtn.disabled = false;
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    });

    shareBtn.addEventListener("click", async function () {
        if (!currentLocationLink) return;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: "My Safety Location",
                    text: "Here is my current location.",
                    url: currentLocationLink
                });
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(currentLocationLink);
                status.textContent = "Location link copied. Ab ise share kar sakte hain.";
            } else {
                window.prompt("Copy your location link:", currentLocationLink);
            }
        } catch (error) {
            if (error.name !== "AbortError") {
                status.textContent =
                    "Share nahi ho paya. Dobara try karein.";
            }
        }
    });

    // Map section visible hone par map ka layout refresh karein.
    setTimeout(function () {
        map.invalidateSize();
    }, 200);
});
document.addEventListener("DOMContentLoaded", function () {
    const hospitalsBtn = document.getElementById("findHospitalsBtn");
    const policeBtn = document.getElementById("findPoliceBtn");
    const status = document.getElementById("locationStatus");

    if (!hospitalsBtn || !policeBtn || !status || !window.lifeLineMap) {
        console.error("Location map ya buttons nahi mile.");
        return;
    }

    const map = window.lifeLineMap;
    let nearbyMarkers = [];

    async function findNearbyPlaces(type) {
        if (!navigator.geolocation) {
            status.textContent = "Aapke browser mein location support nahi hai.";
            return;
        }

        status.textContent = "Aapki location aur nearby places search ho rahe hain...";
        hospitalsBtn.disabled = true;
        policeBtn.disabled = true;

        navigator.geolocation.getCurrentPosition(async function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            const tag = type === "hospital"
                ? '["amenity"="hospital"]'
                : '["amenity"="police"]';

            const query = `
                [out:json][timeout:20];
                (
                  node${tag}(around:5000,${lat},${lng});
                  way${tag}(around:5000,${lat},${lng});
                  relation${tag}(around:5000,${lat},${lng});
                );
                out center tags;
            `;

            try {
                const response = await fetch(
                    "https://overpass-api.de/api/interpreter",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        body: "data=" + encodeURIComponent(query)
                    }
                );

                if (!response.ok) {
                    throw new Error("Places search failed");
                }

                const data = await response.json();

                nearbyMarkers.forEach(marker => map.removeLayer(marker));
                nearbyMarkers = [];

                const places = data.elements || [];

                places.forEach(place => {
                    const placeLat = place.lat ?? place.center?.lat;
                    const placeLng = place.lon ?? place.center?.lon;

                    if (placeLat == null || placeLng == null) return;

                    
const name = place.tags?.name ||
    (type === "hospital" ? "Hospital" : "Police Station");

// Current location se distance calculate karo (Haversine formula)
const earthRadius = 6371;
const toRadians = degrees => degrees * Math.PI / 180;

const dLat = toRadians(placeLat - lat);
const dLng = toRadians(placeLng - lng);

const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat)) *
    Math.cos(toRadians(placeLat)) *
    Math.sin(dLng / 2) ** 2;

const distance = 2 * earthRadius *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

const marker = L.marker([placeLat, placeLng])
    .addTo(map)
    .bindPopup(
        `<b>${name}</b><br>` +
        `Approx. distance: ${distance.toFixed(2)} km<br>` +
        `<a href="https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${placeLat},${placeLng}" target="_blank" rel="noopener noreferrer">Get Directions</a>`
    );


                    nearbyMarkers.push(marker);
                });

                if (places.length === 0) {
                    status.textContent =
                        "Is area mein OpenStreetMap par koi matching place nahi mila. Ye zaroori nahi ki wahan koi facility hai hi nahi.";
                } else {
                    status.textContent =
                        places.length + " nearby results mile. Map markers par click karke directions dekhein.";
                }
            } catch (error) {
                console.error(error);
                status.textContent =
                    "Places load nahi ho paaye. Internet check karke thodi der baad try karein.";
            } finally {
                hospitalsBtn.disabled = false;
                policeBtn.disabled = false;
            }
        }, function () {
            status.textContent =
                "Location permission allow karein, phir dobara try karein.";
            hospitalsBtn.disabled = false;
            policeBtn.disabled = false;
        }, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
        });
    }

    hospitalsBtn.addEventListener("click", function () {
        findNearbyPlaces("hospital");
    });

    policeBtn.addEventListener("click", function () {
        findNearbyPlaces("police");
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const sosShareBtn = document.getElementById("sosShareLocationBtn");
    const status = document.getElementById("locationStatus");

    if (!sosShareBtn || !status) return;

    sosShareBtn.addEventListener("click", function () {
        const confirmed = confirm(
            "Emergency location share karna chahte hain?\n\n" +
            "Aapki current location share karne se pehle permission maangi jayegi."
        );

        if (!confirmed) return;

        if (!navigator.geolocation) {
            status.textContent = "Is browser mein location support nahi hai.";
            return;
        }

        sosShareBtn.disabled = true;
        status.textContent = "Emergency location detect ho rahi hai...";

        navigator.geolocation.getCurrentPosition(
            async function (position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                const link =
                    "https://www.google.com/maps?q=" + lat + "," + lng;

                const message =
                    "I may need help. Here is my current location: " + link;

                try {
                    if (navigator.share) {
                        await navigator.share({
                            title: "LifeLine 360 - Emergency Location",
                            text: message
                        });

                        status.textContent =
                            "Share menu khul gaya. Contact select karke khud send karein.";
                    } else if (navigator.clipboard) {
                        await navigator.clipboard.writeText(message);

                        status.textContent =
                            "Emergency location message copy ho gaya. Ab trusted contact ko paste karke bhejein.";
                    } else {
                        window.prompt(
                            "Is message ko copy karke trusted contact ko bhejein:",
                            message
                        );

                        status.textContent =
                            "Message ko trusted contact ke saath share karein.";
                    }
                } catch (error) {
                    if (error.name !== "AbortError") {
                        status.textContent =
                            "Share nahi ho paya. Dobara try karein.";
                    }
                } finally {
                    sosShareBtn.disabled = false;
                }
            },
            function (error) {
                if (error.code === 1) {
                    status.textContent =
                        "Location permission deny hui. Browser settings mein allow karke try karein.";
                } else {
                    status.textContent =
                        "Location detect nahi hui. Internet aur location settings check karein.";
                }

                sosShareBtn.disabled = false;
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    });
});

/* LifeLine 360 - Google Sign-In */

const googleLoginBtn = document.getElementById("googleLoginBtn");

if (googleLoginBtn && typeof supabaseClient !== "undefined") {
    googleLoginBtn.addEventListener("click", async function () {
        googleLoginBtn.disabled = true;
        googleLoginBtn.textContent = "Connecting to Google...";

        try {
            const { error } = await supabaseClient.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: window.location.origin
                }
            });

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error("Google Login Error:", error);

            const message =
                document.getElementById("authMessage") ||
                document.getElementById("authModalMessage");

            if (message) {
                message.textContent =
                    "Google login failed: " + error.message;
            }

            googleLoginBtn.disabled = false;
            googleLoginBtn.textContent = "🌐 Continue with Google";
        }
    });
}


