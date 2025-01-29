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


