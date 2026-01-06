#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// API 路径映射
const pathMappings = {
  '#/api/system/admin': '#/api/v1/sys-admin',
  '#/api/system/dept': '#/api/v1/sys-dept',
  '#/api/system/dict/data': '#/api/v1/dict-data',
  '#/api/system/dict/type': '#/api/v1/dict-type',
  '#/api/system/menu': '#/api/v1/sys-menu',
  '#/api/system/notice': '#/api/v1/sys-notice',
  '#/api/system/notify/message': '#/api/v1/sys-notify-message',
  '#/api/system/operate-log': '#/api/v1/sys-operate-log',
  '#/api/system/post': '#/api/v1/sys-post',
  '#/api/system/role': '#/api/v1/sys-role',
  '#/api/system/tenant': '#/api/v1/sys-tenant',
};

// 类型名称映射
const typeMappings = {
  'SystemAdminApi': 'SysAdmin',
  'SystemDeptApi': 'SysDept',
  'SystemDictDataApi': 'DictData',
  'SystemDictTypeApi': 'DictType',
  'SystemMenuApi': 'SysMenu',
  'SystemNoticeApi': 'SysNotice',
  'SystemNotifyMessageApi': 'SysNotifyMessage',
  'SystemOperateLogApi': 'SysOperateLog',
  'SystemPostApi': 'SysPost',
  'SystemRoleApi': 'SysRole',
  'SystemTenantApi': 'SysTenant',
};

// 函数名称映射规则
const functionMappings = {
  // Admin
  'createAdmin': 'createSysAdmin',
  'deleteAdmin': 'deleteSysAdmin',
  'getAdminInfo': 'getSysAdminInfo',
  'getAdminList': 'getSysAdminList',
  'getAdminSelector': 'getSysAdminSelector',
  'updateAdmin': 'updateSysAdmin',
  'resetAdminPassword': 'updateSysAdminPassword',
  'updateAdminStatus': 'updateSysAdminStatus',

  // Dept
  'createDept': 'createSysDept',
  'deleteDept': 'deleteSysDept',
  'getDeptInfo': 'getSysDeptInfo',
  'getDeptList': 'getSysDeptList',
  'updateDept': 'updateSysDept',

  // Dict Data
  'createDictData': 'createDictDatum',
  'deleteDictData': 'deleteDictDatum',
  'getDictDataInfo': 'getDictDatumInfo',
  'getDictDataList': 'getDictDatumList',
  'updateDictData': 'updateDictDatum',
  'updateDictDataStatus': 'updateDictDatumStatus',

  // Dict Type
  'createDictType': 'createDictType',
  'deleteDictType': 'deleteDictType',
  'getDictTypeInfo': 'getDictTypeInfo',
  'getDictTypeList': 'getDictTypeList',
  'getDictTypeSelector': 'getDictTypeSelector',
  'updateDictType': 'updateDictType',
  'updateDictTypeStatus': 'updateDictTypeStatus',

  // Menu
  'createMenu': 'createSysMenu',
  'deleteMenu': 'deleteSysMenu',
  'getMenuInfo': 'getSysMenuInfo',
  'getMenuList': 'getSysMenuList',
  'updateMenu': 'updateSysMenu',

  // Notice
  'createNotice': 'createSysNotice',
  'deleteNotice': 'deleteSysNotice',
  'getNoticeInfo': 'getSysNoticeInfo',
  'getNoticeList': 'getSysNoticeList',
  'updateNotice': 'updateSysNotice',
  'pushNotice': 'updateSysNoticeStatus',

  // Notify Message
  'getNotifyMessageList': 'getSysNotifyMessageList',
  'readNotifyMessage': 'updateSysNotifyMessageRead',
  'readAllNotifyMessage': 'updateSysNotifyMessageReadAll',

  // Operate Log
  'getOperateLogList': 'getSysOperateLogList',

  // Post
  'createPost': 'createSysPost',
  'deletePost': 'deleteSysPost',
  'getPostInfo': 'getSysPostInfo',
  'getPostList': 'getSysPostList',
  'getPostSelector': 'getSysPostSelector',
  'updatePost': 'updateSysPost',

  // Role
  'createRole': 'createSysRole',
  'deleteRole': 'deleteSysRole',
  'getRoleInfo': 'getSysRoleInfo',
  'getRoleList': 'getSysRoleList',
  'getRoleSelector': 'getSysRoleSelector',
  'updateRole': 'updateSysRole',

  // Tenant
  'createTenant': 'createSysTenant',
  'deleteTenant': 'deleteSysTenant',
  'getTenantInfo': 'getSysTenantInfo',
  'getTenantList': 'getSysTenantList',
  'updateTenant': 'updateSysTenant',
};

console.log('🔍 查找需要更新的文件...\n');

// 查找所有需要更新的文件
const files = execSync(
  `grep -rl "from '#/api/system/" /Users/fuzhifei/code/go/src/github.com/fzf-labs/ai-boilerplate/ai-boilerplate-admin/apps/web-antd/src/views`,
  { encoding: 'utf-8' }
).trim().split('\n').filter(f => f);

console.log(`找到 ${files.length} 个文件需要更新\n`);

let updatedCount = 0;
let errorCount = 0;

files.forEach((file) => {
  try {
    let content = fs.readFileSync(file, 'utf-8');
    let modified = false;

    // 1. 更新导入路径
    Object.entries(pathMappings).forEach(([oldPath, newPath]) => {
      if (content.includes(oldPath)) {
        content = content.replace(new RegExp(oldPath.replace(/\//g, '\\/'), 'g'), newPath);
        modified = true;
      }
    });

    // 2. 更新类型名称 (SystemXxxApi.Yyy → XxxYyyInfo)
    Object.entries(typeMappings).forEach(([oldType, newType]) => {
      // 匹配 SystemXxxApi.Yyy 模式
      const regex = new RegExp(`${oldType}\\.(\\w+)`, 'g');
      if (content.match(regex)) {
        content = content.replace(regex, (match, prop) => {
          // 大多数情况下，属性名就是类型名，加上 Info 后缀
          return `${newType}Info`;
        });
        modified = true;
      }
    });

    // 3. 更新函数名称
    Object.entries(functionMappings).forEach(([oldFunc, newFunc]) => {
      const regex = new RegExp(`\\b${oldFunc}\\b`, 'g');
      if (content.match(regex)) {
        content = content.replace(regex, newFunc);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(file, content, 'utf-8');
      console.log(`✅ ${path.relative(process.cwd(), file)}`);
      updatedCount++;
    }
  } catch (error) {
    console.error(`❌ ${file}: ${error.message}`);
    errorCount++;
  }
});

console.log(`\n📊 更新完成:`);
console.log(`   ✅ 成功: ${updatedCount} 个文件`);
console.log(`   ❌ 失败: ${errorCount} 个文件`);
console.log(`\n⚠️  注意: 函数调用签名已更改，需要手动调整:`);
console.log(`   旧: createAdmin(data)`);
console.log(`   新: createSysAdmin({ body: data })`);
console.log(`\n   旧: getAdminInfo(id)`);
console.log(`   新: getSysAdminInfo({ params: { id } })`);
