let searchPath = [];

// UI Logic: Tab Switching
function setTab(n) {
    document.querySelectorAll('.tab, .input-box').forEach(el => el.classList.remove('active'));
    document.getElementById('tab'+n).classList.add('active');
    document.getElementById('box'+n).classList.add('active');
}

// Logic for "Is Root" checkbox
function toggleChild() {
    const isR = document.getElementById('mRoot').checked;
    const cInput = document.getElementById('mChild');
    cInput.disabled = isR;
    cInput.style.background = isR ? "#f0f0f0" : "#fff";
    document.getElementById('childLabel').style.opacity = isR ? "0.5" : "1";
}

// Depth-Limited Search Algorithm
function dls(node, target, depth, limit) {
    if (!node) return null;
    if (node.name.toLowerCase() === target.toLowerCase()) return [node.name];
    if (depth >= limit) return null;
    for (let child of node.children) {
        let path = dls(child, target, depth + 1, limit);
        if (path) return [node.name, ...path];
    }
    return null;
}

// Run the Search
function runDLS() {
    const target = document.getElementById('targetName').value.trim();
    const limit = parseInt(document.getElementById('depthLimit').value);
    const s = document.getElementById('status');
    
    if (!target) {
        s.innerText = "Please enter a target name.";
        s.style.color = "var(--danger)";
        return;
    }
    
    const baseNode = buildHierarchy();
    searchPath = [];
    
    let result = dls(baseNode, target, 0, limit);
    if (result) {
        searchPath = result;
        s.innerText = "? Found: " + searchPath.join(" ? ");
        s.style.color = "#2ecc71";
    } else {
        s.innerText = "? Not found within depth limit " + limit;
        s.style.color = "#e74c3c";
        searchPath = [];
    }
    draw(); 
}

// Canvas Rendering Logic
function draw() {
    const canvas = document.getElementById('treeCanvas');
    const ctx = canvas.getContext('2d');
    const baseNode = buildHierarchy();
    ctx.clearRect(0,0,canvas.width, canvas.height);
    renderNode(ctx, baseNode, canvas.width/2, 60, 0, 350);
}

function renderNode(ctx, node, x, y, level, gap) {
    if (!node) return;
    const limitVal = parseInt(document.getElementById('depthLimit').value);
    const isSelected = searchPath.includes(node.name);

    // Draw connecting lines
    if (node.children.length > 0) {
        let cx = x - (node.children.length - 1) * gap / 2;
        node.children.forEach(c => {
            const childSelected = isSelected && searchPath.includes(c.name);
            ctx.beginPath();
            ctx.moveTo(x, y + 20);
            ctx.lineTo(cx, y + 80);
            ctx.strokeStyle = childSelected ? "#f1c40f" : "#ddd";
            ctx.lineWidth = childSelected ? 5 : 2;
            ctx.stroke();
            renderNode(ctx, c, cx, y + 100, level + 1, gap / 2.5);
            cx += gap;
        });
    }
    
    // Draw Node Circles
    ctx.beginPath();
    ctx.arc(x, y, 32, 0, Math.PI*2);
    ctx.fillStyle = isSelected ? "#fff9c4" : "white";
    ctx.fill();
    ctx.strokeStyle = isSelected ? "#f1c40f" : (level === limitVal ? "#e74c3c" : "#4a90e2");
    ctx.lineWidth = isSelected ? 5 : 2;
    ctx.stroke();
    ctx.fillStyle = "#2c3e50"; 
    ctx.font = isSelected ? "bold 11px sans-serif" : "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(node.name, x, y + 5);
}

// Data Parsing Logic
function buildHierarchy() {
    const rawLines = document.getElementById('bulkData').value.split('\n');
    const nodes = {};
    const baseNode = { name: "Human Society", children: [] };
    nodes["Human Society"] = baseNode;

    rawLines.forEach(line => {
        if (!line.includes('|')) return;
        const [p, c] = line.split('|').map(s => s.trim());
        if (!p) return;
        if (!nodes[p]) nodes[p] = { name: p, children: [] };
        if (!c || c.toLowerCase() === 'null') {
            if (!baseNode.children.find(child => child.name === p)) {
                baseNode.children.push(nodes[p]);
            }
        } else {
            if (!nodes[c]) nodes[c] = { name: c, children: [] };
            if (!nodes[p].children.find(child => child.name === c)) {
                nodes[p].children.push(nodes[c]);
            }
        }
    });
    return baseNode;
}

window.onload = () => draw();