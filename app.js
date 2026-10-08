/* =============================================
   SPORTS COMPETITION RANDOMIZER - APP LOGIC
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ── Application State ──
    const State = {
        t1: {
            majors: [],
            colors: [],
            allocated: [],
            currentMajor: null,
            currentColor: null
        },
        t2: {
            majors: [],
            seeds: [1, 2, 3, 4, 5, 6],
            allocated: [],
            currentMajor: null,
            currentSeed: null
        },
        bracket: {
            seeds: { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '' }
        }
    };

    // Color mapper for summary table
    const colorMap = {
        'red': '#ef4444', 'blue': '#3b82f6', 'green': '#10b981',
        'yellow': '#facc15', 'purple': '#a855f7', 'orange': '#f97316',
        'pink': '#ec4899', 'teal': '#14b8a6', 'black': '#000000', 'white': '#ffffff',
        'แดง': '#ef4444', 'สีแดง': '#ef4444',
        'ฟ้า': '#3b82f6', 'สีฟ้า': '#3b82f6',
        'เขียว': '#10b981', 'สีเขียว': '#10b981',
        'เหลือง': '#facc15', 'สีเหลือง': '#facc15',
        'ม่วง': '#a855f7', 'สีม่วง': '#a855f7',
        'ส้ม': '#f97316', 'สีส้ม': '#f97316',
        'ชมพู': '#ec4899', 'สีชมพู': '#ec4899',
        'ดำ': '#000000', 'สีดำ': '#000000',
        'ขาว': '#ffffff', 'สีขาว': '#ffffff'
    };

    const teamMapping = {
        "ทีมที่ 1": "สาขาแอนิเมชัน เกม และดิจิทัลมีเดีย",
        "ทีมที่ 2": "สาขาวิทยาการคอมพิวเตอร์",
        "ทีมที่ 3": "สาขาอาชีวอนามัยและความปลอดภัย",
        "ทีมที่ 4": "สาขาการประกอบและบริการอาหาร",
        "ทีมที่ 5": "สาขาวิทยาศาตร์เครื่องสำอาง, ธุรกิจสุขภาพฯ, สมุนไพรฯ, สิ่งแวดล้อมฯ",
        "ทีมที่ 6": "สาขาเทคโนโลยีสารสนเทศฯ, คอมอิเล็กทรอนิกส์, เทคโนโลยีสุขภาพ"
    };

    function getFullTeamName(item) {
        if (teamMapping[item]) {
            return `${item} (${teamMapping[item]})`;
        }
        return item;
    }

    function getTeamSubTextHTML(item, forModal = false) {
        if (teamMapping[item]) {
            if (forModal) {
                return `<div style="font-size: 1.5rem; color: #ffffff; margin-top: 15px; font-weight: normal;">(${teamMapping[item]})</div>`;
            }
            return `<br><small class="text-white" style="font-weight:normal; opacity: 0.9;">${teamMapping[item]}</small>`;
        }
        return '';
    }

    // ── Utility: Wheel Class ──
    class Wheel {
        constructor(canvasId, items, onSpinEnd) {
            this.canvas = document.getElementById(canvasId);
            this.ctx = this.canvas.getContext('2d');
            this.items = items;
            this.onSpinEnd = onSpinEnd;
            this.currentAngle = 0;
            this.isSpinning = false;
            
            // Standard palette for slices
            this.sliceColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
            
            this.handleDPI();
            this.draw();
        }

        handleDPI() {
            const dpr = window.devicePixelRatio || 1;
            const size = 400; // HTML width/height
            this.canvas.width = size * dpr;
            this.canvas.height = size * dpr;
            this.ctx.scale(dpr, dpr);
            this.size = size;
        }
        
        updateItems(newItems) {
            this.items = newItems;
            this.draw();
        }
        
        draw() {
            const center = this.size / 2;
            const radius = center - 15;
            this.ctx.clearRect(0, 0, this.size, this.size);
            
            if (!this.items || this.items.length === 0) {
                // Empty state
                this.ctx.beginPath();
                this.ctx.arc(center, center, radius, 0, 2 * Math.PI);
                this.ctx.fillStyle = 'rgba(255,255,255,0.05)';
                this.ctx.fill();
                this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
                this.ctx.font = '500 16px Inter';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('No Items', center, center);
                return;
            }
            
            const sliceAngle = (2 * Math.PI) / this.items.length;
            
            for (let i = 0; i < this.items.length; i++) {
                const startAngle = this.currentAngle + i * sliceAngle;
                const endAngle = startAngle + sliceAngle;
                
                this.ctx.beginPath();
                this.ctx.moveTo(center, center);
                this.ctx.arc(center, center, radius, startAngle, endAngle);
                this.ctx.fillStyle = '#121212';
                this.ctx.fill();
                
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                // Draw text
                this.ctx.save();
                this.ctx.translate(center, center);
                this.ctx.rotate(startAngle + sliceAngle / 2);
                
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 16px Inter';
                this.ctx.textAlign = 'right';
                this.ctx.textBaseline = 'middle';
                
                // Truncate text if needed
                let text = String(this.items[i]);
                if (this.ctx.measureText(text).width > radius - 40) {
                    text = text.substring(0, 10) + '...';
                }
                
                this.ctx.fillText(text, radius - 25, 0);
                this.ctx.restore();
            }
            
            // Center pin
            this.ctx.beginPath();
            this.ctx.arc(center, center, 20, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#1e293b';
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }
        
        spin() {
            if (this.isSpinning || this.items.length === 0) return;
            this.isSpinning = true;
            
            const winnerIndex = Math.floor(Math.random() * this.items.length);
            const sliceAngle = (2 * Math.PI) / this.items.length;
            
            // Pointer is at the top (-90 degrees)
            const targetSliceMiddle = winnerIndex * sliceAngle + sliceAngle / 2;
            const targetAngle = -Math.PI / 2 - targetSliceMiddle;
            
            const fullRotations = (Math.floor(Math.random() * 4) + 6) * 2 * Math.PI;
            const finalAngle = targetAngle - fullRotations;
            
            const startAngle = this.currentAngle;
            const duration = 4000;
            const startTime = performance.now();
            
            const easeOut = (t) => 1 - Math.pow(1 - t, 3);
            
            const animate = (now) => {
                const progress = Math.min((now - startTime) / duration, 1);
                this.currentAngle = startAngle + (finalAngle - startAngle) * easeOut(progress);
                this.draw();
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.currentAngle = finalAngle % (2 * Math.PI);
                    this.isSpinning = false;
                    this.onSpinEnd(winnerIndex, this.items[winnerIndex]);
                }
            };
            requestAnimationFrame(animate);
        }
    }

    // ── Modals & Notifications ──
    const resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
    const modalMessage = document.getElementById('modalResultMessage');

    function showResult(message, hexColor = null) {
        modalMessage.innerHTML = message;
        
        const modalContent = document.querySelector('#resultModal .modal-content');
        
        if (hexColor) {
            modalMessage.style.color = hexColor;
            modalMessage.classList.remove('text-white');
            modalContent.style.boxShadow = `0 0 40px ${hexColor}80`; // Add transparency to shadow
            modalContent.style.borderColor = hexColor;
            modalContent.style.borderWidth = '2px';
            modalContent.style.borderStyle = 'solid';
        } else {
            modalMessage.style.color = '';
            modalMessage.classList.add('text-white');
            modalMessage.classList.remove('text-info'); // cleanup
            modalContent.style.boxShadow = '';
            modalContent.style.borderColor = '';
            modalContent.style.borderWidth = '0';
        }
        
        resultModal.show();
        fireConfetti();
    }

    function fireConfetti() {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    }

    // ── Tab Navigation ──
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            const target = e.currentTarget;
            target.classList.add('active');
            document.getElementById(target.dataset.target).classList.add('active');
        });
    });

    function getInputsArray(id) {
        const container = document.getElementById(id);
        const inputs = container.querySelectorAll('input');
        return Array.from(inputs)
            .filter(input => input.style.display !== 'none')
            .map(input => input.value.trim())
            .filter(s => s.length > 0);
    }

    function updateInputsUI(id, arr) {
        const container = document.getElementById(id);
        const inputs = container.querySelectorAll('input');
        for (let i = 0; i < inputs.length; i++) {
            if (i < arr.length) {
                inputs[i].value = arr[i];
                inputs[i].style.display = '';
            } else {
                inputs[i].value = '';
                inputs[i].style.display = 'none';
            }
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }


    // ==========================================
    // MODULE 1: COLOR ALLOCATION
    // ==========================================
    let w1Major, w1Color;
    
    function initTab1() {
        if (localStorage.getItem('savedT1Allocated')) {
            State.t1.allocated = JSON.parse(localStorage.getItem('savedT1Allocated'));
            updateT1Summary();
        }
        if (localStorage.getItem('savedT1Majors')) {
            updateInputsUI('t1MajorsInput', JSON.parse(localStorage.getItem('savedT1Majors')));
        }
        if (localStorage.getItem('savedT1Colors')) {
            const savedColors = JSON.parse(localStorage.getItem('savedT1Colors'));
            // If the old English default 'Purple' is present, ignore the saved list so the new Thai defaults show up
            if (savedColors.includes('Purple')) {
                localStorage.removeItem('savedT1Colors');
            } else {
                updateInputsUI('t1ColorsInput', savedColors);
            }
        }
        State.t1.majors = shuffleArray(getInputsArray('t1MajorsInput'));
        State.t1.colors = shuffleArray(getInputsArray('t1ColorsInput'));
        updateInputsUI('t1MajorsInput', State.t1.majors);
        updateInputsUI('t1ColorsInput', State.t1.colors);
        
        w1Major = new Wheel('t1MajorCanvas', State.t1.majors, (idx, item) => {
            State.t1.currentMajor = item;
            document.getElementById('spinT1MajorBtn').disabled = true;
            document.getElementById('spinT1ColorBtn').disabled = false;
            document.getElementById('spinT1MajorBtn').textContent = `เลือกแล้ว: ${item}`;
            showResult(`สุ่มได้ทีม: ${item}! ${getTeamSubTextHTML(item, true)}`);
        });
        
        w1Color = new Wheel('t1ColorCanvas', State.t1.colors, (idx, item) => {
            State.t1.currentColor = item;
            
            // Match color string to hex if possible
            const lowerColor = item.toLowerCase();
            const hex = colorMap[lowerColor] || '#ffffff';

            // Result!
            showResult(`${State.t1.currentMajor} ได้สี ${State.t1.currentColor}! ${getTeamSubTextHTML(State.t1.currentMajor, true)}`, hex);
            
            // Record
            State.t1.allocated.push({ major: State.t1.currentMajor, color: State.t1.currentColor });
            updateT1Summary();
            
            // Remove from wheels
            State.t1.majors.splice(State.t1.majors.indexOf(State.t1.currentMajor), 1);
            State.t1.colors.splice(State.t1.colors.indexOf(State.t1.currentColor), 1);
            
            // Update Inputs
            updateInputsUI('t1MajorsInput', State.t1.majors);
            updateInputsUI('t1ColorsInput', State.t1.colors);
            
            // Update Wheels
            w1Major.updateItems(State.t1.majors);
            w1Color.updateItems(State.t1.colors);
            
            // Reset Buttons
            const majorBtn = document.getElementById('spinT1MajorBtn');
            majorBtn.disabled = State.t1.majors.length === 0;
            majorBtn.textContent = 'สุ่มสาขาวิชา/ทีม';
            document.getElementById('spinT1ColorBtn').disabled = true;
            
            // Sync to Tab 2 if Tab 2 hasn't started
            if (State.t2.allocated.length === 0 && State.t1.majors.length === 0) {
                // If Tab 1 is fully done, we might want to reset the original majors for Tab 2
                // But let's just let the user use the default or edit it.
            }
        });
    }

    document.getElementById('updateT1MajorsBtn').addEventListener('click', () => {
        const newArr = getInputsArray('t1MajorsInput');
        State.t1.majors = newArr;
        w1Major.updateItems(State.t1.majors);
        document.getElementById('spinT1MajorBtn').disabled = State.t1.majors.length === 0;
    });

    document.getElementById('shuffleT1MajorsBtn').addEventListener('click', () => {
        const newArr = getInputsArray('t1MajorsInput');
        State.t1.majors = shuffleArray(newArr);
        updateInputsUI('t1MajorsInput', State.t1.majors);
        w1Major.updateItems(State.t1.majors);
        document.getElementById('spinT1MajorBtn').disabled = State.t1.majors.length === 0;
    });

    document.getElementById('updateT1ColorsBtn').addEventListener('click', () => {
        const newArr = getInputsArray('t1ColorsInput');
        State.t1.colors = newArr;
        w1Color.updateItems(State.t1.colors);
    });

    document.getElementById('shuffleT1ColorsBtn').addEventListener('click', () => {
        const newArr = getInputsArray('t1ColorsInput');
        State.t1.colors = shuffleArray(newArr);
        updateInputsUI('t1ColorsInput', State.t1.colors);
        w1Color.updateItems(State.t1.colors);
    });

    document.getElementById('spinT1MajorBtn').addEventListener('click', () => {
        if(State.t1.majors.length > 0) w1Major.spin();
    });

    document.getElementById('spinT1ColorBtn').addEventListener('click', () => {
        if(State.t1.colors.length > 0) w1Color.spin();
    });

    function updateT1Summary() {
        const tbody = document.querySelector('#colorSummaryTable tbody');
        tbody.innerHTML = '';
        State.t1.allocated.forEach(entry => {
            const tr = document.createElement('tr');
            
            // Match color string to hex if possible
            const lowerColor = entry.color.toLowerCase();
            const hex = colorMap[lowerColor] || '#ffffff';
            
            tr.innerHTML = `
                <td class="fw-bold text-white">
                    ${entry.major}
                    ${getTeamSubTextHTML(entry.major)}
                </td>
                <td class="text-white">
                    <span class="color-swatch" style="background-color: ${hex}; box-shadow: 0 0 8px ${hex}"></span>
                    ${entry.color}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // ==========================================
    // MODULE 2: BRACKET SEEDING
    // ==========================================
    let w2Major, w2Seed;

    const sportsData = {
        "ฟุตบอล 7 คน": ["ทีมชาย"],
        "วอลเลย์บอล": ["ทีมหญิง"],
        "บาสเกตบอล 5x5": ["ทีมชาย"],
        "แบดมินตัน": ["ชายคู่", "หญิงคู่"],
        "แชร์บอล": ["ทีมหญิง"],
        "เปตอง": ["ชายคู่", "หญิงคู่"],
        "E-sport (ROV)": ["ทีมผสม"],
        "E-sport (Pubg Mobile)": ["ทีมผสม"]
    };

    function initSportsDropdowns() {
        const sportSelect = document.getElementById('t2SportName');
        const catSelect = document.getElementById('t2SportCategory');
        
        Object.keys(sportsData).forEach(sport => {
            const opt = document.createElement('option');
            opt.value = sport;
            opt.textContent = sport;
            sportSelect.appendChild(opt);
        });
        
        sportSelect.addEventListener('change', () => {
            catSelect.innerHTML = '<option value="" disabled selected>เลือกประเภทกีฬา...</option>';
            const categories = sportsData[sportSelect.value];
            if (categories) {
                categories.forEach(cat => {
                    const opt = document.createElement('option');
                    opt.value = cat;
                    opt.textContent = cat;
                    catSelect.appendChild(opt);
                });
                catSelect.disabled = false;
            } else {
                catSelect.disabled = true;
            }
            updateBracketTitle();
        });
        
        catSelect.addEventListener('change', () => {
            updateBracketTitle();
            loadTournamentState();
        });
    }

    const defaultMajors = [
        "ทีมที่ 1",
        "ทีมที่ 2",
        "ทีมที่ 3",
        "ทีมที่ 4",
        "ทีมที่ 5",
        "ทีมที่ 6"
    ];
    const defaultSeeds = ["1", "2", "3", "4", "5", "6"];

    function loadTournamentState() {
        const sportSelect = document.getElementById('t2SportName');
        const catSelect = document.getElementById('t2SportCategory');
        if (!sportSelect.value || !catSelect.value) return;

        const key = `${sportSelect.value}_${catSelect.value}`;

        // Load specific state
        const savedAllocated = localStorage.getItem(`t2Allocated_${key}`);
        State.t2.allocated = savedAllocated ? JSON.parse(savedAllocated) : [];
        
        const savedBracket = localStorage.getItem(`bracketSeeds_${key}`);
        State.bracket.seeds = savedBracket ? JSON.parse(savedBracket) : {};
        
        const savedMajors = localStorage.getItem(`t2Majors_${key}`);
        State.t2.majors = savedMajors ? JSON.parse(savedMajors) : [...defaultMajors];
        
        const savedSeeds = localStorage.getItem(`t2Seeds_${key}`);
        State.t2.seeds = savedSeeds ? JSON.parse(savedSeeds) : [...defaultSeeds];

        updateInputsUI('t2MajorsInput', State.t2.majors);
        updateInputsUI('t2SeedsInput', State.t2.seeds);

        if (w2Major) w2Major.updateItems(State.t2.majors);
        if (w2Seed) w2Seed.updateItems(State.t2.seeds);

        const majorBtn = document.getElementById('spinT2MajorBtn');
        const seedBtn = document.getElementById('spinT2SeedBtn');
        majorBtn.disabled = State.t2.majors.length === 0;
        majorBtn.textContent = 'SPIN MAJOR';
        seedBtn.disabled = true;

        updateBracketUI();
    }

    function initTab2() {
        // Initialize Wheels First with defaults
        State.t2.majors = [...defaultMajors];
        State.t2.seeds = [...defaultSeeds];
        
        w2Major = new Wheel('t2MajorCanvas', State.t2.majors, (idx, item) => {
            State.t2.currentMajor = item;
            document.getElementById('spinT2MajorBtn').disabled = true;
            document.getElementById('spinT2SeedBtn').disabled = false;
            document.getElementById('spinT2MajorBtn').textContent = `เลือกแล้ว: ${item}`;
            showResult(`สุ่มได้ทีม: ${item}! ${getTeamSubTextHTML(item, true)}`);
        });
        
        w2Seed = new Wheel('t2SeedCanvas', State.t2.seeds, (idx, item) => {
            State.t2.currentSeed = item;
            showResult(`${State.t2.currentMajor} ได้สายที่ ${State.t2.currentSeed}! ${getTeamSubTextHTML(State.t2.currentMajor, true)}`);
            
            State.t2.allocated.push({ major: State.t2.currentMajor, seed: State.t2.currentSeed });
            State.bracket.seeds[State.t2.currentSeed] = State.t2.currentMajor;
            updateBracketUI();
            
            State.t2.majors.splice(State.t2.majors.indexOf(State.t2.currentMajor), 1);
            State.t2.seeds.splice(State.t2.seeds.indexOf(State.t2.currentSeed), 1);
            
            updateInputsUI('t2MajorsInput', State.t2.majors);
            updateInputsUI('t2SeedsInput', State.t2.seeds);
            
            w2Major.updateItems(State.t2.majors);
            w2Seed.updateItems(State.t2.seeds);
            
            const majorBtn = document.getElementById('spinT2MajorBtn');
            majorBtn.disabled = State.t2.majors.length === 0;
            majorBtn.textContent = 'สุ่มสาขาวิชา/ทีม';
            document.getElementById('spinT2SeedBtn').disabled = true;
        });

        // Load previously selected sport if any
        const lastSport = localStorage.getItem('lastSelectedSportName');
        const lastCat = localStorage.getItem('lastSelectedSportCat');
        
        if (lastSport) {
            const sportSelect = document.getElementById('t2SportName');
            sportSelect.value = lastSport;
            sportSelect.dispatchEvent(new Event('change'));
            
            if (lastCat) {
                document.getElementById('t2SportCategory').value = lastCat;
                loadTournamentState();
            }
        }
    }

    document.getElementById('updateT2MajorsBtn').addEventListener('click', () => {
        const newArr = getInputsArray('t2MajorsInput');
        State.t2.majors = newArr;
        w2Major.updateItems(State.t2.majors);
        document.getElementById('spinT2MajorBtn').disabled = State.t2.majors.length === 0;
    });

    document.getElementById('shuffleT2MajorsBtn').addEventListener('click', () => {
        const newArr = getInputsArray('t2MajorsInput');
        State.t2.majors = shuffleArray(newArr);
        updateInputsUI('t2MajorsInput', State.t2.majors);
        w2Major.updateItems(State.t2.majors);
        document.getElementById('spinT2MajorBtn').disabled = State.t2.majors.length === 0;
    });

    document.getElementById('updateT2SeedsBtn').addEventListener('click', () => {
        const newArr = getInputsArray('t2SeedsInput');
        State.t2.seeds = newArr;
        w2Seed.updateItems(State.t2.seeds);
    });

    document.getElementById('shuffleT2SeedsBtn').addEventListener('click', () => {
        const newArr = getInputsArray('t2SeedsInput');
        State.t2.seeds = shuffleArray(newArr);
        updateInputsUI('t2SeedsInput', State.t2.seeds);
        w2Seed.updateItems(State.t2.seeds);
    });

    document.getElementById('spinT2MajorBtn').addEventListener('click', () => {
        if(State.t2.majors.length > 0) w2Major.spin();
    });

    document.getElementById('spinT2SeedBtn').addEventListener('click', () => {
        if(State.t2.seeds.length > 0) w2Seed.spin();
    });

    const updateBracketTitle = () => {
        const sport = document.getElementById('t2SportName').value.trim();
        const cat = document.getElementById('t2SportCategory').value.trim();
        let titleText = 'ตารางสายการแข่งขัน';
        if (sport || cat) {
            titleText += ` : ${sport} ${cat ? '(' + cat + ')' : ''}`;
        }
        document.getElementById('bracketTitle').innerHTML = `<i class="bi bi-trophy text-warning"></i> ${titleText}`;
    };

    // ==========================================
    // MODULE 3: TOURNAMENT BRACKET
    // ==========================================
    
    function updateBracketUI() {
        // Populate initial seeds based on Module 2 results
        const getSeedText = (seedNum) => {
            const major = State.bracket.seeds[seedNum];
            return major ? `${major} (สายที่ ${seedNum})` : `สายที่ ${seedNum}`;
        };

        // R1: Match 1
        setTeamText('m1-t1', getSeedText(2));
        setTeamText('m1-t2', getSeedText(3));
        
        // R1: Match 2
        setTeamText('m2-t1', getSeedText(4));
        setTeamText('m2-t2', getSeedText(5));
        
        // R2: Match 3 (Seed 1 vs Winner M1)
        const s1 = State.bracket.seeds[1];
        setTeamText('m3-t1', s1 ? `${s1} (สายที่ 1 - ผ่านเข้ารอบ)` : 'สายที่ 1 (ผ่านเข้ารอบ)');
        
        // R2: Match 4 (Seed 6 vs Winner M2)
        const s6 = State.bracket.seeds[6];
        setTeamText('m4-t1', s6 ? `${s6} (สายที่ 6 - ผ่านเข้ารอบ)` : 'สายที่ 6 (ผ่านเข้ารอบ)');
    }

    function setTeamText(id, text) {
        const el = document.getElementById(id);
        if(el) {
            el.innerHTML = `<span>${text}</span>`;
        }
    }

    // Interactive Bracket Logic
    document.querySelectorAll('.bracket .team').forEach(teamDiv => {
        teamDiv.addEventListener('click', function() {
            // Ignore champion block or placeholders
            if (this.classList.contains('champion') || this.classList.contains('empty-slot')) return;
            
            const matchId = this.dataset.match;
            if (!matchId) return;

            // Clear winner class for siblings in the same match
            const siblings = document.querySelectorAll(`.team[data-match="${matchId}"]`);
            siblings.forEach(sib => sib.classList.remove('winner'));
            
            // Mark this as winner
            this.classList.add('winner');
            
            // Propagate name to next round
            const teamName = this.textContent.replace(' (สายที่ 1 - ผ่านเข้ารอบ)', '').replace(' (สายที่ 6 - ผ่านเข้ารอบ)', '').trim();
            
            switch (matchId) {
                case '1':
                    setTeamText('m3-t2', teamName);
                    break;
                case '2':
                    setTeamText('m4-t2', teamName);
                    break;
                case '3':
                    setTeamText('m5-t1', teamName);
                    break;
                case '4':
                    setTeamText('m5-t2', teamName);
                    break;
                case '5':
                    const champEl = document.getElementById('champion');
                    champEl.textContent = teamName;
                    champEl.classList.add('winner'); // just for color
                    fireConfetti();
                    break;
            }
        });
    });

    // Handle Summary Team Box Clicks (Tab 3)
    document.body.addEventListener('click', function(e) {
        const teamEl = e.target.closest('.summary-team');
        if (teamEl) {
            e.stopPropagation();
            
            const rawTeamStr = teamEl.getAttribute('data-team');
            const cleanName = rawTeamStr.replace(/ \(สายที่ \d+.*\)/, '').trim(); 
            const majorName = teamMapping[cleanName] || "ไม่ระบุสาขา";
            
            document.getElementById('infoModalTeamName').textContent = cleanName;
            document.getElementById('infoModalMajor').textContent = majorName;
            
            let matchDate = teamEl.getAttribute('data-date');
            document.getElementById('infoModalDate').textContent = matchDate || "รอระบุจากฝ่ายจัดฯ";
            
            new bootstrap.Modal(document.getElementById('infoModal')).show();
        }
    });

    // ==========================================
    // MODULE 4: FINAL SUMMARY
    // ==========================================
    
    function getAllSavedTournaments() {
        const allTournaments = [];
        Object.keys(sportsData).forEach(sport => {
            sportsData[sport].forEach(cat => {
                const key = `${sport}_${cat}`;
                const savedStr = localStorage.getItem(`t2Allocated_${key}`);
                if (savedStr) {
                    const bracketSeedsStr = localStorage.getItem(`bracketSeeds_${key}`);
                    const dateStr = localStorage.getItem(`t2Date_${key}`);
                    allTournaments.push({ 
                        sport, 
                        cat, 
                        allocated: JSON.parse(savedStr),
                        bracketSeeds: bracketSeedsStr ? JSON.parse(bracketSeedsStr) : {},
                        date: dateStr || ''
                    });
                }
            });
        });
        
        const sName = document.getElementById('t2SportName').value;
        const sCat = document.getElementById('t2SportCategory').value;
        const sDate = document.getElementById('t2SportDate').value;
        if (sName && sCat && State.t2.allocated.length > 0) {
            if (!allTournaments.find(t => t.sport === sName && t.cat === sCat)) {
                allTournaments.push({ sport: sName, cat: sCat, allocated: State.t2.allocated, bracketSeeds: State.bracket.seeds, date: sDate });
            }
        }
        return allTournaments;
    }

    // SECTION A: Search Major
    const searchMajorInput = document.getElementById('searchMajorInput');
    const searchMajorBtn = document.getElementById('searchMajorBtn');
    
    function performMajorSearch() {
        const query = searchMajorInput.value.toLowerCase().trim();
        const resultContainer = document.getElementById('majorSearchResult');
        
        if (!query) {
            resultContainer.innerHTML = '<div class="text-center text-muted p-4">กรุณาพิมพ์คำค้นหาก่อน</div>';
            resultContainer.style.display = 'block';
            return;
        }

        // Search directly in teamMapping to allow finding teams even without colors assigned
        let matchedMajorKey = null;
        for (let [key, name] of Object.entries(teamMapping)) {
            if (key.toLowerCase().includes(query) || name.toLowerCase().includes(query)) {
                matchedMajorKey = key;
                break;
            }
        }

        if (!matchedMajorKey) {
            resultContainer.innerHTML = '<div class="text-center text-muted p-4">ไม่พบสาขาหรือทีมที่ค้นหา</div>';
            resultContainer.style.display = 'block';
            return;
        }

        const major = matchedMajorKey;
        
        // Try to find if a color is allocated
        const alloc = State.t1.allocated.find(a => a.major === major);
        const colorName = alloc ? alloc.color : 'ยังไม่ระบุสี';
        const hex = alloc ? (colorMap[colorName.toLowerCase()] || '#ffffff') : '#64748b'; // default slate color
        
        const allTourneys = getAllSavedTournaments();
        const playingSports = allTourneys.filter(t => t.allocated.find(a => a.major === major));

        let sportsHtml = '';
        if (playingSports.length === 0) {
            sportsHtml = '<p class="text-muted mt-3 mb-0">ยังไม่มีข้อมูลการแข่งขันกีฬา</p>';
        } else {
            sportsHtml = '<ul class="list-unstyled mt-3 mb-0" style="line-height: 1.8;">';
            playingSports.forEach(t => {
                const seedObj = t.allocated.find(a => a.major === major);
                const seed = seedObj ? seedObj.seed : 'N/A';
                const dateDisplay = t.date ? `(แข่งวันที่ ${t.date})` : '';
                sportsHtml += `<li><i class="bi bi-trophy text-warning me-2"></i> <strong class="text-white">${t.sport} (${t.cat})</strong> - ได้สายที่ ${seed} <span class="text-muted" style="font-size:0.85em;">${dateDisplay}</span></li>`;
            });
            sportsHtml += '</ul>';
        }

        resultContainer.innerHTML = `
            <div class="glass-card" style="border-top: 4px solid ${hex}; position: relative; overflow: hidden; background: rgba(30, 41, 59, 0.7);">
                <div style="position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: ${hex}; opacity: 0.1; border-radius: 0 0 0 100%;"></div>
                <h4 class="fw-bold mb-3 d-flex align-items-center gap-2 text-white">
                    <span class="color-swatch m-0" style="background-color: ${hex}; box-shadow: 0 0 10px ${hex}"></span>
                    สี${colorName}
                </h4>
                <div class="mb-2">
                    <i class="bi bi-building me-2 text-info"></i> <strong class="text-white">${major}</strong>
                    <div class="ms-4" style="color: #e2e8f0;">${teamMapping[major] || ''}</div>
                </div>
                <hr class="border-secondary">
                <h5 class="text-white mt-3 mb-2"><i class="bi bi-list-check text-success"></i> รายการกีฬาที่ลงแข่ง</h5>
                ${sportsHtml}
            </div>
        `;
        resultContainer.style.display = 'block';
    }

    searchMajorBtn.addEventListener('click', performMajorSearch);
    searchMajorInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performMajorSearch();
    });

    // SECTION B: Schedule Filter
    function initScheduleFilters() {
        const sportFilter = document.getElementById('filterSport');
        const catFilter = document.getElementById('filterCategory');
        const dateFilter = document.getElementById('filterDate');
        
        sportFilter.innerHTML = '<option value="">กีฬาทั้งหมด</option>';
        Object.keys(sportsData).forEach(sport => {
            const opt = document.createElement('option');
            opt.value = sport;
            opt.textContent = sport;
            sportFilter.appendChild(opt);
        });

        sportFilter.addEventListener('change', () => {
            catFilter.innerHTML = '<option value="">ประเภททั้งหมด</option>';
            if (sportFilter.value) {
                const categories = sportsData[sportFilter.value];
                categories.forEach(cat => {
                    const opt = document.createElement('option');
                    opt.value = cat;
                    opt.textContent = cat;
                    catFilter.appendChild(opt);
                });
                catFilter.disabled = false;
            } else {
                catFilter.disabled = true;
            }
        });
        
        document.getElementById('searchScheduleBtn').addEventListener('click', renderSchedule);
    }

    function generateBracketHtml(t) {
        const bracketSeeds = t.bracketSeeds;
        const getSeedText = (seedNum) => {
            const major = bracketSeeds[seedNum];
            return major ? `${major} (สายที่ ${seedNum})` : `สายที่ ${seedNum}`;
        };

        const s1 = bracketSeeds[1];
        const s6 = bracketSeeds[6];
        
        const formatTeam = (text) => {
            let colorHtml = '';
            const cleanName = text.replace(/ \(สายที่ \d+.*\)/, '').trim();
            const alloc = State.t1.allocated.find(a => a.major === cleanName);
            if (alloc) {
                const hex = colorMap[alloc.color.toLowerCase()] || '#ffffff';
                colorHtml = ` border-left: 4px solid ${hex};`;
            }
            const hasTeamData = text.includes('ทีมที่') || text.includes('สายที่');
            const clickStyle = hasTeamData ? 'cursor: pointer;' : 'cursor: default; pointer-events: none;';
            const dataAttrs = hasTeamData ? ` data-team="${text}" data-date="${t.date || ''}" class="team summary-team"` : ' class="team"';
            return `<div${dataAttrs} style="${clickStyle} background: rgba(15, 23, 42, 0.6);${colorHtml}"><span>${text}</span></div>`;
        };

        return `
        <div style="overflow-x: auto; padding: 20px 0;">
            <div class="bracket-wrapper" style="transform: scale(0.85); transform-origin: left top; width: 115%; min-width: 900px; margin-bottom: -50px;">
                <div class="bracket">
                    <div class="round round-1">
                        <div class="round-title" style="line-height: 1.4;">รอบคัดเลือก<br><span style="font-size: 0.7em; opacity: 0.7; font-weight: normal;">4-5 พ.ย. 2569</span></div>
                        <div class="matchup empty"></div>
                        <div class="matchup">
                            ${formatTeam(getSeedText(2))}
                            ${formatTeam(getSeedText(3))}
                        </div>
                        <div class="matchup empty"></div>
                        <div class="matchup">
                            ${formatTeam(getSeedText(4))}
                            ${formatTeam(getSeedText(5))}
                        </div>
                    </div>
                    <div class="round round-2">
                        <div class="round-title" style="line-height: 1.4;">รอบรองชนะเลิศ<br><span style="font-size: 0.7em; opacity: 0.7; font-weight: normal;">6 พ.ย. 2569</span></div>
                        <div class="matchup">
                            ${formatTeam(s1 ? `${s1} (สายที่ 1 - ผ่านเข้ารอบ)` : 'สายที่ 1 (ผ่านเข้ารอบ)')}
                            ${formatTeam('ผู้ชนะแมตช์ 1')}
                        </div>
                        <div class="matchup">
                            ${formatTeam(s6 ? `${s6} (สายที่ 6 - ผ่านเข้ารอบ)` : 'สายที่ 6 (ผ่านเข้ารอบ)')}
                            ${formatTeam('ผู้ชนะแมตช์ 2')}
                        </div>
                    </div>
                    <div class="round round-3">
                        <div class="round-title text-success" style="line-height: 1.4;">รอบชิงชนะเลิศ<br><span style="font-size: 0.7em; opacity: 0.7; font-weight: normal;">7 พ.ย. 2569</span></div>
                        <div class="matchup final-match">
                            ${formatTeam('ผู้ชนะแมตช์ 3')}
                            ${formatTeam('ผู้ชนะแมตช์ 4')}
                        </div>
                    </div>
                    <div class="round round-4 champion-round">
                        <div class="round-title text-warning">ทีมชนะเลิศ</div>
                        <div class="matchup">
                            <div class="team champion" style="cursor: default; pointer-events: none; background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 2px solid #f59e0b;">รอผลการแข่งขัน</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    function renderSchedule() {
        const container = document.getElementById('scheduleResultContainer');
        const emptyState = document.getElementById('scheduleEmptyState');
        const emptyText = document.getElementById('scheduleEmptyText');
        
        if (!container || !emptyState) return;

        const fDate = document.getElementById('filterDate').value;
        const fSport = document.getElementById('filterSport').value;
        const fCat = document.getElementById('filterCategory').value;

        const allTourneys = getAllSavedTournaments();
        
        const filtered = allTourneys.filter(t => {
            if (fDate && t.date !== fDate) return false;
            if (fSport && t.sport !== fSport) return false;
            if (fCat && t.cat !== fCat) return false;
            return true;
        });

        // Clear previous elements
        Array.from(container.children).forEach(child => {
            if (child.id !== 'scheduleEmptyState') child.remove();
        });

        if (filtered.length === 0) {
            emptyState.style.display = 'block';
            if (emptyText) emptyText.textContent = "ไม่มีข้อมูลการแข่งขันที่ตรงกับเงื่อนไข หรือยังไม่ได้บันทึกข้อมูล";
            const icon = emptyState.querySelector('.bi');
            if (icon) {
                icon.classList.remove('bi-calendar-check');
                icon.classList.add('bi-calendar-x');
            }
            return;
        }

        emptyState.style.display = 'none';

        filtered.forEach(t => {
            const wrapper = document.createElement('div');
            wrapper.className = 'glass-card mb-5';
            wrapper.style.background = 'rgba(30, 41, 59, 0.4)';
            
            const dateDisplay = t.date ? t.date : '<span class="text-warning">ไม่ได้ระบุวันที่</span>';
            
            wrapper.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3">
                    <h4 class="text-warning mb-0"><i class="bi bi-controller"></i> ${t.sport} (${t.cat})</h4>
                    <span class="badge bg-secondary p-2" style="font-size: 0.9em;"><i class="bi bi-calendar-event me-1"></i> ${dateDisplay}</span>
                </div>
                ${generateBracketHtml(t)}
            `;
            container.appendChild(wrapper);
        });
    }

    // ── Save & Reset ──
    const saveModal = new bootstrap.Modal(document.getElementById('saveModal'));
    const resetModal = new bootstrap.Modal(document.getElementById('resetModal'));

    document.getElementById('saveDataBtn').addEventListener('click', () => {
        const t1m = getInputsArray('t1MajorsInput');
        const t1c = getInputsArray('t1ColorsInput');
        const t2m = getInputsArray('t2MajorsInput');
        const t2s = getInputsArray('t2SeedsInput');
        const sName = document.getElementById('t2SportName').value;
        const sCat = document.getElementById('t2SportCategory').value;
        const sDate = document.getElementById('t2SportDate').value;
        
        // Save Global State
        localStorage.setItem('savedT1Majors', JSON.stringify(t1m));
        localStorage.setItem('savedT1Colors', JSON.stringify(t1c));
        localStorage.setItem('savedT1Allocated', JSON.stringify(State.t1.allocated));
        
        // Save Sport-Specific State
        if (sName && sCat) {
            const key = `${sName}_${sCat}`;
            localStorage.setItem(`t2Majors_${key}`, JSON.stringify(t2m));
            localStorage.setItem(`t2Seeds_${key}`, JSON.stringify(t2s));
            localStorage.setItem(`t2Allocated_${key}`, JSON.stringify(State.t2.allocated));
            localStorage.setItem(`bracketSeeds_${key}`, JSON.stringify(State.bracket.seeds));
            localStorage.setItem(`t2Date_${key}`, sDate);
            
            localStorage.setItem('lastSelectedSportName', sName);
            localStorage.setItem('lastSelectedSportCat', sCat);
        }
        
        saveModal.show();
    });

    document.getElementById('resetDataBtn').addEventListener('click', () => {
        resetModal.show();
    });

    document.getElementById('confirmResetBtn').addEventListener('click', () => {
        localStorage.clear();
        location.reload();
    });

    // ── Initialization ──
    initSportsDropdowns();
    initScheduleFilters();
    initTab1();
    initTab2();
    updateBracketTitle();
    updateBracketUI();

});

