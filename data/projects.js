// 自动生成，请勿手改。改文案请编辑 data/curated.json
window.KM_PROJECTS = {
  "generated_at": "2026-10-27T07:38:38.432Z",
  "has_live_stats": true,
  "projects": [
    {
      "id": "living-world-rp",
      "repo": "kcz-666/living-world-rp",
      "layout": "large",
      "title": "活档案",
      "sub": "/ 多世界角色扮演平台",
      "tag": "node.js · sqlite · sse · in progress",
      "desc": "自研精简的多世界角色扮演平台。AI 生成世界，NPC、地点、事件全部落库随剧情成长；导演系统让角色在玩家离线时也按日程“活着”。",
      "status": "building",
      "statusClass": "wip",
      "stacks": [
        "Node.js",
        "Express",
        "better-sqlite3",
        "SSE",
        "火山方舟"
      ],
      "type": "node.js · sqlite · sse · building",
      "highlight": "回合编译器：模型输出当“待编译源码”，四层降级拆分，编译不出就报错绝不静默",
      "sections": [
        {
          "h": "核心模块",
          "l": [
            "turncompiler — 模型输出编译成 Change[]，单事务落库",
            "director + simulation — 导演批量规划 + 倒扣时钟推进器",
            "assemble — 预算制三层漏斗装配 prompt，含认知过滤（玩家只知已知之事）",
            "taskoutcome — 对人任务由模型判定成败并如实落库",
            "visual — SSE 秒级推送的实时可视化大屏"
          ]
        },
        {
          "h": "基建细节",
          "l": [
            "23 张表，WAL + 外键，schema 校验脚本把关",
            "开发者通道 8 条路由默认上锁（DEV_TOKEN）",
            "每环节文件日志，按天切分"
          ]
        }
      ],
      "stats": {
        "pushed_at": "2026-10-17T08:32:07Z",
        "updated_at": "2026-10-17T08:32:11Z",
        "size_kb": 498,
        "private": true,
        "default_branch": "main",
        "language": "JavaScript",
        "languages": [
          {
            "name": "JavaScript",
            "pct": 93
          },
          {
            "name": "CSS",
            "pct": 4
          },
          {
            "name": "HTML",
            "pct": 3
          }
        ],
        "last_commit": {
          "message": "init: 活档案多世界角色扮演平台",
          "date": "2026-10-17T06:21:07Z"
        }
      }
    },
    {
      "id": "rance03-editor",
      "repo": "kcz-666/rance03-editor",
      "layout": "tall",
      "title": "兰斯03修改器",
      "sub": "",
      "tag": "binary · reverse · done",
      "desc": "纯本地存档修改器。RSM v9 存档格式、EX 二进制数据、AIN 代码补丁、AFA/QNT 立绘解码，全链路手写解析，打包 exe 发了朋友。",
      "status": "shipped",
      "statusClass": "done",
      "stacks": [
        "Python",
        "tkinter",
        "binary"
      ],
      "type": "binary · reverse · shipped",
      "highlight": "RSM v9 存档格式 + EX 二进制 + AIN 代码补丁 + AFA/QNT 图片，四个格式全链路手写解析",
      "deco": true,
      "sections": [
        {
          "h": "格式解析",
          "l": [
            "rsm.py — RSM v9 存档解析/序列化",
            "exparse.py — Rance03.ex 二进制解析（角色/技能数据）",
            "afa.py + qnt.py — AFA 封包读取 + QNT 图片解码（角色立绘）"
          ]
        },
        {
          "h": "补丁功能",
          "l": [
            "expatch.py — EX 数据补丁：关闭遇敌、技能冷却改 0",
            "ainpatch.py — AIN 代码补丁：迷宫卡片透视"
          ]
        },
        {
          "h": "安全设计",
          "l": [
            "每次保存前自动 .bak 备份，原版文件另有独立备份目录",
            "纯 Python 实现，不运行任何第三方 exe"
          ]
        }
      ],
      "stats": {
        "pushed_at": "2026-10-17T08:32:11Z",
        "updated_at": "2026-10-17T08:32:14Z",
        "size_kb": 42,
        "private": true,
        "default_branch": "main",
        "language": "Python",
        "languages": [
          {
            "name": "Python",
            "pct": 100
          },
          {
            "name": "Batchfile",
            "pct": 0
          }
        ],
        "last_commit": {
          "message": "init: 兰斯03存档修改器",
          "date": "2026-10-17T06:21:18Z"
        }
      }
    },
    {
      "id": "cx-exam-float",
      "repo": "kcz-666/cx-exam-float",
      "layout": "wide",
      "title": "AI 答题悬浮窗",
      "sub": "",
      "tag": "windows api · multi-llm · done",
      "desc": "超星考试客户端工具。窗口置顶防录屏、本地题库搜索、四家 AI 轮换问答。第一个“发出去别人真在用”的工具。",
      "status": "archived",
      "statusClass": "done",
      "stacks": [
        "Python",
        "Win32 API",
        "4× LLM",
        "multithread"
      ],
      "type": "windows api · multi-llm · archived",
      "highlight": "SetWindowDisplayAffinity 防录屏 + 置顶，F3 隐藏到屏幕边缘",
      "sections": [
        {
          "h": "窗口技巧",
          "l": [
            "SetWindowDisplayAffinity 防录屏/截屏捕获",
            "Ctrl+滚轮调透明度（0.1-1.0），Alt+滚轮调字号",
            "F3 一键隐藏/恢复，Ctrl+左键自由拖动"
          ]
        },
        {
          "h": "AI 接入",
          "l": [
            "四家 AI：星火 WebSocket / DeepSeek HTTP / 豆包 / MiMo",
            "AI 问答多线程，界面不卡",
            "config.yaml 只存 DeepSeek 配置，二次开发友好"
          ]
        }
      ],
      "stats": {
        "pushed_at": "2026-10-17T08:32:15Z",
        "updated_at": "2026-10-17T08:32:19Z",
        "size_kb": 36,
        "private": true,
        "default_branch": "main",
        "language": "Python",
        "languages": [
          {
            "name": "Python",
            "pct": 91
          },
          {
            "name": "Batchfile",
            "pct": 9
          }
        ],
        "last_commit": {
          "message": "init: 超星考试 AI 悬浮窗工具（二次开发）",
          "date": "2026-10-17T06:21:32Z"
        }
      }
    },
    {
      "id": "esp32-s3-lab",
      "repo": "kcz-666/esp32-s3-lab",
      "layout": "full",
      "title": "ESP32-S3 硬件方向",
      "sub": "",
      "tag": "hardware · edge ai · not started",
      "desc": "还没开始，正在选题。想做一个能撑场面的完整项目，三个候选方案在桌上。",
      "status": "selecting topic",
      "statusClass": "future",
      "stacks": [
        "ESP-IDF",
        "C/C++",
        "TinyML",
        "sensors"
      ],
      "type": "hardware · edge ai · not started",
      "highlight": "第一行代码还没写，先写在了这个网站上",
      "dashed": true,
      "sections": [
        {
          "h": "候选 A（首推）",
          "l": [
            "边缘智能设备状态监测与异常预警",
            "ESP32-S3 + 振动/声音传感器",
            "INT8 量化模型板端推理",
            "边云协同对比实验"
          ]
        },
        {
          "h": "候选 B",
          "l": [
            "多节点低功耗环境监测与预警平台",
            "ESP-NOW / LoRa 组网",
            "时序预测"
          ]
        },
        {
          "h": "候选 C",
          "l": [
            "离线语音交互终端",
            "声学调试门槛高，备选"
          ]
        }
      ],
      "stats": {
        "pushed_at": "2026-10-17T08:32:20Z",
        "updated_at": "2026-10-17T08:32:24Z",
        "size_kb": 1,
        "private": true,
        "default_branch": "main",
        "language": null,
        "languages": [],
        "last_commit": {
          "message": "init: ESP32-S3 硬件方向选题记录",
          "date": "2026-10-17T06:21:43Z"
        }
      }
    },
    {
      "id": "brewing",
      "repo": null,
      "layout": "small",
      "title": "还在酝酿",
      "sub": "",
      "tag": "idea · brewing",
      "desc": "有几个模糊的想法，等一个合适的时机。",
      "status": "tbd",
      "statusClass": "future",
      "stacks": [],
      "type": "idea · brewing",
      "highlight": "…",
      "sections": [
        {
          "h": "候选池",
          "l": [
            "没想好",
            "真的没想好"
          ]
        }
      ],
      "stats": null
    }
  ]
};
