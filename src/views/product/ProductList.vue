<template>
  <page-header-wrapper
    :tab-list="tabList"
    :tab-active-key="tabActiveKey"
    :animated="true"
    :tab-change="(key)=>tabChange(key)"
  >
    <a-card>
      <div v-if="this.tabActiveKey === 'goods_list'">
        <GoodsList></GoodsList>
      </div>
      <div v-else>
        <AddGoods @toGoodsList="reload"></AddGoods>
      </div>
    </a-card>

  </page-header-wrapper>
</template>

<script>
  import GoodsList from './GoodsList'
  import AddGoods from './AddGoods'
  export default {
    name: 'ProductList',
    components: {
       GoodsList,
       AddGoods
    },
    data () {
      this.tabList = [
        { key: 'goods_list', tab: '商品列表' },
        { key: 'goods_form', tab: '新增商品' },
      ]
      return {
        tabActiveKey: 'goods_list'
      }
    },
    methods: {
      tabChange (key) {
        this.tabActiveKey = key
      },
      reload(flag) {
        console.log(flag)
        if (flag) {
          this.tabActiveKey = 'goods_list'
        }
      }
    }
  }
</script>

<style scoped lang="less">
</style>