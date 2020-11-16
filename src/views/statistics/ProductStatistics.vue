<template>
  <page-header-wrapper>
    <a-card style="background-color: #ececec;">
      <div slot="extra">
        <a-input-group compact>
          <a-select style="width: 30%" v-model="type" @change='this.categoryId=[]'>
            <a-select-option :value="0">所有商品</a-select-option>
            <a-select-option :value="1">产品分类</a-select-option>
          </a-select>

          <a-cascader 
          :disabled="type!=1"
          
          style="width: 70%" :options="categorys"
           placeholder="请选择"
           :changeOnSelect="true"
           :fieldNames="{label:'name',value:'id',children:'children'}" 
           v-model="categoryId"
           @change='selectCategory'/>
           
        </a-input-group>
      </div>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card title="已上架商品" :bordered="false">
            <a-statistic :value="data.onSaleCount" :value-style="{ color: '#3f8600' }"></a-statistic>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="未上架商品" :bordered="false">
            <a-statistic :value="data.unSaleCount" :value-style="{ color: '#cf1322' }"></a-statistic>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="商品总量" :bordered="false">
            <a-statistic :value="data.goodsTotal"></a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import { notification } from 'ant-design-vue'
import { getGoodsStatistics } from '@/api/statistics'
import { getTree } from '@/api/category'
import { getAllBrand } from '@/api/brand'

export default {
  name: 'ProductStatistics',
  data() {
    return {
      data: {},
      categorys: [],
      brands: [],
      type: 0,
      categoryId : null
    }
  },
  created() {
    this.getGoodsStatistics({})
  },
  watch: {
    type(val) {
      if (val == 1) {
        getTree().then((res) => {
          if (res.success) {
            this.categorys = res.data.tree
          } else {
            notification.error({
              message: '失败',
              notification: res.msg,
            })
          }
        })
      } else if (val == 2) {
        getAllBrand().then((res) => {
          if (res.success) {
            this.brands = res.data.list
          } else {
            notification.error({
              message: '失败',
              notification: res.msg,
            })
          }
        })
      }
    },
  },
  methods: {
    getGoodsStatistics(params) {
      getGoodsStatistics(params).then((res) => {
        if (res.success) {
          this.data = res.data.data
        } else {
          notification.error({
            message: '失败',
            description: res.msg,
          })
        }
      })
    },
    selectCategory() {
        this.getGoodsStatistics({categoryId : this.categoryId[this.categoryId.length - 1]})
    }
  },
}
</script>

<style scoped>
</style>