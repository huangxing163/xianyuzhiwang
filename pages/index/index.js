Page({
  data: {
    teams: [
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
    ],
    showAddModal: false,
    showBatchModal: false,
    newMember: {
      name: '',
      red: '',
      power: ''
    },
    batchText: ''
  },

  onLoad() {
    // 从本地存储获取数据
    const storageData = wx.getStorageSync('teamData');
    if (storageData) {
      this.setData({ teams: storageData });
    } else {
      // 初始化默认数据
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

      initialMembers.forEach(member => {
        this.addMemberToTeam(member);
      });
    }
  },

  // 保存数据到本地存储
  saveToStorage() {
    wx.setStorageSync('teamData', this.data.teams);
  },

  // 添加成员到最适合的团队
  addMemberToTeam(member) {
    const teams = this.data.teams;
    // 根据战力和红数平衡分配到合适的团队
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
    this.updateTeamStats();
    this.saveToStorage();
  },

  // 更新团队统计数据
  updateTeamStats() {
    const teams = this.data.teams;
    teams.forEach(team => {
      team.totalPower = team.members.reduce((sum, member) => sum + Number(member.power), 0).toFixed(2);
      team.totalRed = team.members.reduce((sum, member) => sum + Number(member.red), 0);
    });
    this.setData({ teams });
  },

  // 显示添加成员弹窗
  showAddModal() {
    this.setData({
      showAddModal: true,
      newMember: { name: '', red: '', power: '' }
    });
  },

  // 显示批量添加弹窗
  showBatchAddModal() {
    this.setData({
      showBatchModal: true,
      batchText: ''
    });
  },

  // 取消添加
  cancelAdd() {
    this.setData({ 
      showAddModal: false,
      showBatchModal: false
    });
  },

  // 确认添加单个成员
  confirmAdd() {
    const { newMember } = this.data;
    if (!newMember.name || !newMember.red || !newMember.power) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    this.addMemberToTeam({
      name: newMember.name,
      red: Number(newMember.red),
      power: Number(newMember.power)
    });

    this.setData({ showAddModal: false });
  },

  // 确认批量添加
  confirmBatchAdd() {
    const { batchText } = this.data;
    const lines = batchText.split('\n');
    
    lines.forEach(line => {
      const parts = line.trim().split(/[-\s]+/);
      if (parts.length >= 3) {
        const member = {
          name: parts[0],
          red: parseInt(parts[1]),
          power: parseFloat(parts[2])
        };
        this.addMemberToTeam(member);
      }
    });

    this.setData({ showBatchModal: false });
  },

  // 展开/收起团队
  toggleTeam(e) {
    const teamIndex = e.currentTarget.dataset.team - 1;
    const teams = this.data.teams;
    teams[teamIndex].expanded = !teams[teamIndex].expanded;
    this.setData({ teams });
  },

  // 删除成员
  deleteMember(e) {
    const name = e.currentTarget.dataset.name;
    const teams = this.data.teams;
    
    teams.forEach(team => {
      team.members = team.members.filter(member => member.name !== name);
    });

    this.updateTeamStats();
    this.saveToStorage();
  },

  // 编辑成员
  editMember(e) {
    const member = e.currentTarget.dataset.member;
    this.setData({
      showAddModal: true,
      newMember: { ...member }
    });
  }
}); 