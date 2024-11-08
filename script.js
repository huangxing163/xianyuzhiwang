let teams = [
    {
        expanded: true,
        totalPower: 0,
        totalRed: 0,
        members: []
    },
    {
        expanded: true,
        totalPower: 0,
        totalRed: 0,
        members: []
    },
    {
        expanded: true,
        totalPower: 0,
        totalRed: 0,
        members: []
    }
];

// 初始化数据
function initializeData() {
    const storageData = localStorage.getItem('teamData');
    if (storageData) {
        teams = JSON.parse(storageData);
    } else {
        const initialMembers = [
            { name: '菜鸡', red: 30, power: 106 },
            { name: '诸天至尊', red: 18, power: 5 },
            { name: '飞鸟和蝉', red: 15, power: 80 },
            { name: '蓝桉', red: 14, power: 70 },
            { name: '额', red: 20, power: 80 },
            { name: '海洋', red: 13, power: 84 },
            { name: '骏', red: 18, power: 83.67 },
            { name: '老刘', red: 29, power: 112 },
            { name: '西瓜', red: 19, power: 76.19 },
            { name: '羊', red: 2, power: 22 },
            { name: 'ぃ__霸气づ↗', red: 6, power: 60 },
            { name: 'wisdom', red: 8, power: 53 },
            { name: '马龙', red: 17, power: 42 },
            { name: '高中生', red: 14, power: 68 }
        ];

        initialMembers.forEach(member => addMemberToTeam(member));
    }
    renderTeams();
}

function saveToStorage() {
    localStorage.setItem('teamData', JSON.stringify(teams));
}

function addMemberToTeam(member) {
    let targetTeamIndex = 0;
    let minPowerDiff = Infinity;

    teams.forEach((team, index) => {
        const powerDiff = Math.abs(team.totalPower - (member.power || 0));
        if (powerDiff < minPowerDiff) {
            minPowerDiff = powerDiff;
            targetTeamIndex = index;
        }
    });

    teams[targetTeamIndex].members.push(member);
    updateTeamStats();
    saveToStorage();
}

function updateTeamStats() {
    teams.forEach(team => {
        team.totalPower = team.members.reduce((sum, member) => sum + Number(member.power), 0).toFixed(2);
        team.totalRed = team.members.reduce((sum, member) => sum + Number(member.red), 0);
    });
}

function renderTeams() {
    const teamList = document.getElementById('teamList');
    teamList.innerHTML = teams.map((team, index) => `
        <div class="team-header" onclick="toggleTeam(${index})">
            <span>${index + 1}团</span>
            <span>${team.totalPower}亿</span>
            <span>${team.totalRed}红</span>
            <span>${team.members.length}人</span>
        </div>
        ${team.expanded ? `
            <div class="member-list">
                ${team.members.map(member => `
                    <div class="member-item">
                        <span>${member.name}</span>
                        <span>${member.power}亿</span>
                        <span>${member.red}红</span>
                        <div class="operations">
                            <button onclick="moveToTeam('${member.name}', ${index})">移动</button>
                            <button onclick="editMember('${member.name}')">编辑</button>
                            <button onclick="deleteMember('${member.name}')">删除</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
    `).join('');
}

function showAddModal() {
    document.getElementById('addModal').style.display = 'flex';
}

function showBatchModal() {
    document.getElementById('batchModal').style.display = 'flex';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function confirmAdd() {
    const name = document.getElementById('memberName').value;
    const red = document.getElementById('memberRed').value;
    const power = document.getElementById('memberPower').value;

    if (!name || !red || !power) {
        alert('请填写完整信息');
        return;
    }

    if (currentEditingMember) {
        deleteMember(currentEditingMember.name, true);
        currentEditingMember = null;
    }

    addMemberToTeam({
        name,
        red: Number(red),
        power: Number(power)
    });

    document.getElementById('memberName').value = '';
    document.getElementById('memberRed').value = '';
    document.getElementById('memberPower').value = '';
    hideModal('addModal');
    renderTeams();
}

function confirmBatchAdd() {
    const batchText = document.getElementById('batchText').value;
    const lines = batchText.split('\n');
    
    lines.forEach(line => {
        const parts = line.trim().split(/[-\s]+/);
        if (parts.length >= 3) {
            const member = {
                name: parts[0],
                red: parseInt(parts[1]),
                power: parseFloat(parts[2])
            };
            addMemberToTeam(member);
        }
    });

    document.getElementById('batchText').value = '';
    hideModal('batchModal');
    renderTeams();
}

function toggleTeam(index) {
    teams[index].expanded = !teams[index].expanded;
    renderTeams();
}

let currentEditingMember = null;

function deleteMember(name, skipRender = false) {
    teams.forEach(team => {
        team.members = team.members.filter(member => member.name !== name);
    });
    updateTeamStats();
    saveToStorage();
    if (!skipRender) {
        renderTeams();
    }
}

function editMember(name) {
    let member;
    teams.forEach(team => {
        const found = team.members.find(m => m.name === name);
        if (found) member = found;
    });

    if (member) {
        currentEditingMember = { ...member };
        document.getElementById('memberName').value = member.name;
        document.getElementById('memberRed').value = member.red;
        document.getElementById('memberPower').value = member.power;
        showAddModal();
    }
}

// 页面加载时初始化数据
window.onload = initializeData;

// 添加移动相关的变量
let currentMovingMember = null;
let currentTeamIndex = null;

// 显示移动弹窗
function moveToTeam(name, fromTeamIndex) {
    let member;
    teams.forEach(team => {
        const found = team.members.find(m => m.name === name);
        if (found) member = found;
    });

    if (member) {
        currentMovingMember = { ...member };
        currentTeamIndex = fromTeamIndex;
        
        // 更新下拉列表选项，排除当前团
        const select = document.getElementById('targetTeam');
        select.innerHTML = teams.map((team, index) => 
            index !== fromTeamIndex ? 
            `<option value="${index}">${index + 1}团</option>` : 
            ''
        ).join('');
        
        document.getElementById('moveModal').style.display = 'flex';
    }
}

// 确认移动
function confirmMove() {
    if (!currentMovingMember || currentTeamIndex === null) return;

    const targetTeamIndex = parseInt(document.getElementById('targetTeam').value);
    
    // 从原团队中删除
    teams[currentTeamIndex].members = teams[currentTeamIndex].members.filter(
        member => member.name !== currentMovingMember.name
    );

    // 添加到新团队
    teams[targetTeamIndex].members.push(currentMovingMember);

    // 更新统计数据
    updateTeamStats();
    saveToStorage();
    renderTeams();

    // 重置状态
    currentMovingMember = null;
    currentTeamIndex = null;
    hideModal('moveModal');
} 