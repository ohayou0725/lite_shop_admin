<template>
  <page-header-wrapper>
    <template v-slot:content>
      <div class="page-header-content">
        <div class="avatar">
          <a-avatar size="large" :src="userInfo.avatar"/>
        </div>
        <div class="content">
          <div class="content-title">
            {{ timeFix }}，{{ user.name }}<span class="welcome-text">，{{ welcome }}</span>
          </div>
          <div>上次登录时间:{{lastLoginTime}}</div>
        </div>
      </div>
    </template>
    <template v-slot:extraContent>
      <div class="extra-content">
        <div class="stat-item">
          <a-statistic
        :title="moment().format('YYYY年MM月DD日')"
        :value="dateTime"
        style="margin-right: 50px"
        />
        
        </div>
       
      </div>
    </template>

    <div>
      <a-row :gutter="[16,16]">
      <a-col :span='8' :style="{ marginBottom: '24px' }">
        <chart-card  title="今日销售额" total="￥126,560">
          <a-tooltip title="指标说明" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>
            <trend flag="down">
              <span slot="term">日同比</span>
              11%
            </trend>
          </div>
        </chart-card>
      </a-col>
      <a-col :span='8' :style="{ marginBottom: '24px' }">
        <chart-card  title="今日订单数" :total="8846 | NumberFormat">
          <a-tooltip title="指标说明" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>
            <mini-area />
          </div>
        </chart-card>
      </a-col>
      <a-col :span='8' :style="{ marginBottom: '24px' }">
        <chart-card title="支付笔数" :total="6560 | NumberFormat">
          <a-tooltip title="指标说明" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>
            <mini-bar />
          </div>
        </chart-card>
      </a-col>
      <!-- <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
        <chart-card :loading="loading" title="运营活动效果" total="78%">
          <a-tooltip title="指标说明" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>
            <mini-progress color="rgb(19, 194, 194)" :target="80" :percentage="78" height="8px" />
          </div>
          <template slot="footer">
            <trend flag="down" style="margin-right: 16px;">
              <span slot="term">同周比</span>
              12%
            </trend>
            <trend flag="up">
              <span slot="term">日环比</span>
              80%
            </trend>
          </template>
        </chart-card>
      </a-col> -->
    </a-row>
    </div>
  </page-header-wrapper>
</template>

<script>
import { timeFix } from '@/utils/util'
import { mapState } from 'vuex'
import { PageHeaderWrapper } from '@ant-design-vue/pro-layout'


import moment from 'moment'

import {
  ChartCard,
  MiniArea,
  MiniBar,
  MiniProgress,
  RankList,
  Bar,
  Trend,
  NumberInfo,
  MiniSmoothArea
} from '@/components'

const DataSet = require('@antv/data-set')

export default {
  name: 'Workplace',
  components: {
    PageHeaderWrapper,
    ChartCard,
    MiniArea,
    MiniBar,
    MiniProgress,
    RankList,
    Bar,
    Trend,
    NumberInfo,
    MiniSmoothArea
  },
  
  data () {
    return {
      moment : moment,
      timeFix: timeFix(),
      avatar: '',
      user: {},
      dateTime : moment().format('dddd  HH:mm:ss'),
      lastLoginTime : 'null',

      
      // data
      
    }
  },
  computed: {
    ...mapState({
      nickname: (state) => state.user.nickname,
      welcome: (state) => state.user.welcome
    }),
    
    userInfo () {
      return this.$store.getters.userInfo
    }
  },
  created () {
    this.user = this.userInfo
    this.avatar = this.userInfo.avatar

   
  },
  mounted () {
    let that = this
    this.timer = setInterval(()=>{
      that.dateTime = moment().format('dddd  HH:mm:ss');
    },1000)
    this.lastLoginTime = this.user.lastLoginTime
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer); // 在Vue实例销毁前，清除我们的定时器
    }
  },
  methods: {
    
  }
}
</script>

<style lang="less" scoped>
  @import "./Workplace.less";

  

</style>
