<template>
  <!-- 面包屑导航与新增按钮在同一行 -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
    <el-breadcrumb :separator=">" style="display: flex; align-items: center;">
      <el-breadcrumb-item :to="{ path: 
      
    }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>营销中心</el-breadcrumb-item>
      <el-breadcrumb-item>优惠券管理</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 新增按钮 -->
    <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
  </div>

  <el-table :data="state.tableData" style="width: 100%" border stripe>
    <!-- 前端计算序号 -->
    <el-table-column fixed label="编号" width="150">
      <template #default="scope">
        {{ (state.pageNum - 1) * state.pageSize + scope.$index + 1 }}
      </template>
    </el-table-column>
    <el-table-column prop="couponId" label="优惠券ID" width="120" />
    <el-table-column prop="couponName" label="优惠券名称" width="150" />
    <el-table-column prop="couponType" label="优惠券类型" width="120" />
    <el-table-column prop="discountValue" label="折扣值" width="100" />
    <el-table-column prop="minOrderAmount" label="最低订单金额" width="150" />
    <el-table-column prop="startDate" label="开始日期" width="150" />
    <el-table-column prop="endDate" label="结束日期" width="150" />
    <el-table-column prop="status" label="状态" width="100">
      <template #default="scope">
        <el-tag :type="getStatusType(scope.row.status)">
          {{ getStatusText(scope.row.status) }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column fixed="right" label="操作" min-width="120">
      <template #default="scope">
        <el-tooltip content="编辑" placement="top">
          <!-- 编辑按钮 -->
          <el-button 
            :icon="Edit" 
            size="small" 
            type="primary" 
            @click="handleEdit(scope.row)"
            class="edit-btn"
          />
        </el-tooltip>
        <el-tooltip content="删除" placement="top">
          <!-- 删除按钮 -->
          <el-button 
            :icon="Delete" 
            size="small" 
            type="primary" 
            @click="handleDelete(scope.row)"
            class="delete-btn"
          />
        </el-tooltip>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分页工具栏 -->
  <div style="position: fixed; bottom: 20px; left: 0; right: 0; display: flex; justify-content: center; z-index: 10;">
    <el-pagination
      background
      layout="prev, pager, next"
      :total="state.total"
      :page-size="state.pageSize"
      @current-change="refreshData"
    ></el-pagination>
  </div>

  <el-dialog v-model="state.dialogFormVisible" :title="state.dialogTitle" width="600">
    <el-form :model="state.form" ref="ruleFormRef" :rules="rules">
      <el-form-item 
        label="优惠券ID" 
        :label-width="state.formLabelWidth" 
        prop="couponId"
        v-if="state.isEdit"
      >
        <el-input v-model="state.form.couponId" autocomplete="off" readonly />
      </el-form-item>
      <el-form-item label="优惠券名称" :label-width="state.formLabelWidth" prop="couponName">
        <el-input v-model="state.form.couponName" autocomplete="off" />
      </el-form-item>
      <el-form-item label="优惠券类型" :label-width="state.formLabelWidth" prop="couponType">
        <el-input v-model="state.form.couponType" autocomplete="off" />
      </el-form-item>
      <el-form-item label="折扣值" :label-width="state.formLabelWidth" prop="discountValue">
        <el-input-number v-model="state.form.discountValue" :min="0" />
      </el-form-item>
      <el-form-item label="最低订单金额" :label-width="state.formLabelWidth" prop="minOrderAmount">
        <el-input-number v-model="state.form.minOrderAmount" :min="0" />
      </el-form-item>
      <el-form-item label="开始日期" :label-width="state.formLabelWidth" prop="startDate">
        <el-date-picker
          v-model="state.form.startDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          style="width: 100%"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="结束日期" :label-width="state.formLabelWidth" prop="endDate">
        <el-date-picker
          v-model="state.form.endDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          style="width: 100%"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="状态" :label-width="state.formLabelWidth" prop="status">
        <el-select v-model="state.form.status" placeholder="请选择状态">
          <el-option label="可用" value="available"></el-option>
          <el-option label="已使用" value="used"></el-option>
          <el-option label="已过期" value="expired"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="state.dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm(ruleFormRef)">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from (
  

