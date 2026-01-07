<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteMembershipBenefit,
  getMembershipBenefitList,
  updateMembershipBenefitStatus,
} from '#/api/v1/membership-benefit';
import { $t } from '#/locales';

import {
  useBenefitGridColumns,
  useBenefitGridFormSchema,
} from './benefit-data';
import BenefitForm from './benefit-form.vue';


const modalTitle = computed(() => {
  return `${membershipData.value?.name || ''} - 权益管理`;
});

const [BenefitFormModal, benefitFormModalApi] = useVbenModal({
  connectedComponent: BenefitForm,
  destroyOnClose: true,
});

/** 刷新表格 */
function onRefresh() {
  gridApi.query();
}

/** 创建权益 */
function onCreate() {
  benefitFormModalApi
    .setData({ membershipType: membershipData.value?.type })
    .open();
}

/** 编辑权益 */
  benefitFormModalApi.setData(row).open();
}

/** 删除权益 */
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.benefitName]),
    duration: 0,
    key: 'action_process_msg',
  });
  try {
    await deleteMembershipBenefit({ id: row.id });
    message.success({
      content: $t('ui.actionMessage.deleteSuccess', [row.benefitName]),
      key: 'action_process_msg',
    });
    onRefresh();
  } catch {
    hideLoading();
  }
}

/** 状态变更 */
async function onStatusChange(
  newStatus: number,
) {
  try {
    await updateMembershipBenefitStatus({
      id: row.id,
      status: newStatus,
    });
    message.success({
      content: $t('ui.actionMessage.operationSuccess'),
      key: 'action_process_msg',
    });
    onRefresh();
    return true;
  } catch {
    return false;
  }
}

/** 表格操作按钮的回调函数 */
function onActionClick({
  code,
  row,
  switch (code) {
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
  }
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useBenefitGridFormSchema(),
  },
  gridOptions: {
    columns: useBenefitGridColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          if (!membershipData.value?.type) return { list: [], total: 0 };
          return await getMembershipBenefitList({
            page: page.currentPage,
            pageSize: page.pageSize,
            membershipType: membershipData.value.type,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    showOverflow: 'tooltip',
    size: 'small',
    stripe: true,
    border: true,
    toolbarConfig: {
      refresh: { code: 'query' },
      search: true,
    },
});

const [Modal, modalApi] = useVbenModal({
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      membershipData.value = undefined;
      return;
    }

    // 获取传入的会员数据
    if (!data) {
      return;
    }

    membershipData.value = data;

    // 延迟刷新权益列表，确保表格已经渲染
    setTimeout(() => {
      onRefresh();
    }, 100);
  },
});
</script>

<template>
  <Modal :title="modalTitle" width="1200px">
    <BenefitFormModal @success="onRefresh" />

    <Grid table-title="权益列表">
      <template #toolbar-tools>
        <Button
          type="primary"
          @click="onCreate"
          v-access:code="['member:membership-benefit:create']"
        >
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', ['权益']) }}
        </Button>
      </template>
    </Grid>
  </Modal>
</template>
