// ==== USERS SEMENTARA ====
const users = [
    { username: "admin", password: "123", role: "ADMIN" },
    { username: "manager", password: "123", role: "MANAGER" },
    { username: "kasir", password: "123", role: "KASIR" }
];

let currentRole = null;

function generateToken() {
    return btoa(Math.random().toString()).substring(10, 15);
}

function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const loginBtn = document.getElementById("loginBtn");

    loginBtn.innerText = "Loading...";
    loginBtn.disabled = true;

    setTimeout(() => {
        const foundUser = users.find(u => u.username === username && u.password === password);

        if (!foundUser) {
            alert("Username atau password salah!");
            loginBtn.innerText = "Login";
            loginBtn.disabled = false;
            return;
        }

        currentRole = foundUser.role;
        const token = generateToken();
        localStorage.setItem('sessionToken', token);
        localStorage.setItem('userRole', currentRole);

        // Redirect based on role
        if (currentRole === "KASIR") {
            window.location.href = "pos.html";
        } else {
            window.location.href = "dashboard.html";
        }

        loginBtn.innerText = "Login";
        loginBtn.disabled = false;

    }, 500);
}

function logout() {
    currentRole = null;
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('userRole');
    window.location.href = "../index.html";
}

function showPage(pageId) {
    // Simple implementation: redirect to the page
    window.location.href = pageId + ".html";
}

// Check session on page load for protected pages
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('sessionToken');
    currentRole = localStorage.getItem('userRole');
    if (!token || !currentRole) {
        // If no session, redirect to login if on protected page
        if (window.location.pathname.includes('dashboard.html') ||
            window.location.pathname.includes('category.html') ||
            window.location.pathname.includes('products.html') ||
            window.location.pathname.includes('stock.html') ||
            window.location.pathname.includes('delivery.html') ||
            window.location.pathname.includes('pos.html') ||
            window.location.pathname.includes('barcode.html')) {
            window.location.href = "login.html";
        }
    } else {
        // For role-based navigation, hide/show menu items
        setupRoleBasedUI();
    }
});

function setupRoleBasedUI() {
    if (!currentRole) return;

    const menuItems = {
        dashboard: document.querySelector('a[href="dashboard.html"]')?.closest('li'),
        category: document.querySelector('a[href="category.html"]')?.closest('li'),
        products: document.querySelector('a[href="products.html"]')?.closest('li'),
        barcode: document.querySelector('a[href="barcode.html"]')?.closest('li'),
        stock: document.querySelector('a[href="stock.html"]')?.closest('li'),
        delivery: document.querySelector('a[href="delivery.html"]')?.closest('li'),
        pos: document.querySelector('a[href="pos.html"]')?.closest('li'),
        logout: document.querySelector('a[onclick*="logout"]')?.closest('li')
    };

    // Hide all first
    Object.values(menuItems).forEach(item => {
        if (item) item.style.display = 'none';
    });

    // Show based on role
    if (currentRole === 'ADMIN') {
        // Show all
        Object.values(menuItems).forEach(item => {
            if (item) item.style.display = 'block';
        });
    } else if (currentRole === 'MANAGER') {
        if (menuItems.dashboard) menuItems.dashboard.style.display = 'block';
        if (menuItems.stock) menuItems.stock.style.display = 'block';
        if (menuItems.barcode) menuItems.barcode.style.display = 'block'; // assuming transactions
        if (menuItems.logout) menuItems.logout.style.display = 'block';
    } else if (currentRole === 'KASIR') {
        if (menuItems.pos) menuItems.pos.style.display = 'block';
        if (menuItems.logout) menuItems.logout.style.display = 'block';
    }
}

// Landing page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe animated elements
    const animatedElements = document.querySelectorAll('.animate-slide-left, .animate-slide-right');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(' + (el.classList.contains('animate-slide-left') ? '50px' : '-50px') + ')';
        observer.observe(el);
    });
});

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    sidebar.classList.toggle("-translate-x-full");
    overlay.classList.toggle("hidden");
}
