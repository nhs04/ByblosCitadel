function toggleDescription(id) {
    let element = document.getElementById(id);

    // Close all open descriptions
    document.querySelectorAll('.description').forEach(desc => {
        if (desc.id !== id) {
            desc.classList.remove('active');
        }
    });

    // Toggle selected description
    element.classList.toggle('active');
}

const header = document.querySelector(".artifacts-header");

window.addEventListener("scroll", function(){
    header.classList.toggle("sticky", window.scrollY > 60);
});

const main_header = document.querySelector(".header-main");

window.addEventListener("scroll", function(){
    main_header.classList.toggle("sticky", window.scrollY > 130);
});

document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("modelModal");
    const closeBtn = document.querySelector(".close");
    const buttons = document.querySelectorAll(".check-btn"); // Select all buttons
    const iframe = document.getElementById("sketchfabEmbed"); // Get the iframe

    // Define model URLs for each artifact
    const modelLinks = {
        "Phoenician Rock": "https://sketchfab.com/models/2424d39e951c4e63b3b8e8bfb16d86e3/embed",
        "Column Base": "https://sketchfab.com/models/f050459a86784f0baa6f13529d4f2faa/embed",
        "Altar": "https://sketchfab.com/models/042f81b9c9264b0ea1ca538c5569277f/embed"
    };

    // Open modal when any "Check Object" button is clicked
    buttons.forEach((button, index) => {
        button.addEventListener("click", function () {
            const artifactTitle = this.parentElement.parentElement.querySelector("h2").innerText;
            if (modelLinks[artifactTitle]) {
                iframe.src = modelLinks[artifactTitle]; // Update iframe source dynamically
            }
            modal.style.display = "flex";
        });
    });

    // Close the modal when the 'X' button is clicked
    closeBtn.addEventListener("click", function () {
        modal.style.display = "none";
    });

    // Close modal if clicked outside content
    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".hamburger-menu");
    const mobileMenu = document.getElementById("mobileMenu");
    const closeBtn = document.querySelector(".close-btn");
    const menuLinks = document.querySelectorAll(".mobile-menu ul li a");

    // Function to open menu
    function openMenu() {
        mobileMenu.classList.add("show");
    }

    // Function to close menu
    function closeMenu() {
        mobileMenu.classList.remove("show");
    }

    // Open menu when clicking the hamburger icon
    hamburger.addEventListener("click", openMenu);

    // Close menu when clicking the X button
    closeBtn.addEventListener("click", closeMenu);

    // Close menu when clicking any menu link
    menuLinks.forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    // Close menu when clicking anywhere outside of it
    document.addEventListener("click", function (event) {
        if (!mobileMenu.contains(event.target) && !hamburger.contains(event.target)) {
            closeMenu();
        }
    });
});

function toggleDescription(id) {
    let element = document.getElementById(id);

    // Close all open descriptions
    document.querySelectorAll('.description').forEach(desc => {
        if (desc.id !== id) {
            desc.classList.remove('active');
        }
    });

    // Toggle selected description
    element.classList.toggle('active');
}

document.addEventListener("DOMContentLoaded", function() {
    const oldImages1 = ["imgs/IMG_2842.JPG", "imgs/IMG_2845.JPG", "imgs/IMG_2847.JPG"];
    const newImages1 = ["imgs/IMG_2851.JPG", "imgs/IMG_2850.JPG", "imgs/IMG_2842.JPG"];

    const oldImages2 = ["imgs/IMG_2845.JPG", "imgs/IMG_2851.JPG", "imgs/IMG_2846.JPG"];
    const newImages2 = ["imgs/IMG_2847.JPG", "imgs/IMG_2845.JPG", "imgs/IMG_2850.JPG"];

    let index = 0;

    function changeImages() {
        index = (index + 1) % oldImages1.length; // Loop through images

        // Change images for first pair
        document.querySelector(".old-image-1").src = oldImages1[index];
        document.querySelector(".new-image-1").src = newImages1[index];

        // Change images for second pair
        document.querySelector(".old-image-2").src = oldImages2[index];
        document.querySelector(".new-image-2").src = newImages2[index];

        // Smooth transition effect
        document.querySelector(".new-image-1").style.opacity = "1";
        document.querySelector(".new-image-2").style.opacity = "1";

        setTimeout(() => {
            document.querySelector(".new-image-1").style.opacity = "0";
            document.querySelector(".new-image-2").style.opacity = "0";
        }, 3000);
    }

    setInterval(changeImages, 5000);
});


function toggleReadMore(button) {
    const description = button.previousElementSibling; // Get the paragraph before the button
    const moreText = description.querySelector(".more-text");

    if (moreText.style.display === "none" || moreText.style.display === "") {
        moreText.style.display = "inline";  // Show more text
        button.textContent = "Read Less";   // Change button text
    } else {
        moreText.style.display = "none";    // Hide text again
        button.textContent = "Read More";   // Revert button text
    }
}
