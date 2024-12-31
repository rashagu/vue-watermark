import { type ShallowRef, nextTick, watch } from 'vue'
// import { debounce } from 'lodash'

export function useObserver(watermarkContainerRef: ShallowRef<HTMLDivElement | undefined>, watermarkRef: ShallowRef<HTMLDivElement | undefined>, cb: () => void) {
  let startObserver: MutationObserver
  let selfObserver: MutationObserver

  // const startWatch = debounce(startWatch_, 300)

  function startWatch() {
    // console.log('startWatch')
    nextTick(() => {
      selfCheck()
      startObserverFn()
    })
  }

  function disconnectAll() {
    startObserver.disconnect()
    selfObserver?.disconnect()
  }
  function startObserverFn() {
    // 选择需要观察的目标节点
    const targetNode = watermarkContainerRef.value
    if (targetNode) {
      // 配置观察选项
      const config = { childList: true }

      // 创建一个回调函数，当观察到DOM变化时执行
      const callback: MutationCallback = function (mutationsList, observer) {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList') {
            // console.log('A child node has been added or removed.')
            observer.disconnect()
            selfObserver?.disconnect()
            cb()
            nextTick(() => {
              startWatch()
            })
          }
        }
      }

      // 创建一个观察器实例并传入回调函数
      startObserver = new MutationObserver(callback)

      // 开始观察目标节点
      startObserver.observe(targetNode, config)

      // 停止观察
      // observer.disconnect();
    }
  }

  function selfCheck() {
    // 选择需要观察的目标节点
    const targetNode = watermarkRef.value
    if (targetNode) {
      // 配置观察选项
      const config = { attributes: true }

      // 创建一个回调函数，当观察到DOM变化时执行
      const callback: MutationCallback = function (mutationsList, observer) {
        for (const mutation of mutationsList) {
          if (mutation.type === 'attributes') {
            // console.log(`The ${mutation.attributeName} attribute was modified.`)
            observer.disconnect()
            startObserver.disconnect()
            cb()
            nextTick(() => {
              startWatch()
            })
          }
        }
      }
      // 创建一个观察器实例并传入回调函数
      selfObserver = new MutationObserver(callback)

      // 开始观察目标节点
      selfObserver.observe(targetNode, config)

      // 停止观察
      // observer.disconnect();
    }
  }

  watch([watermarkContainerRef, watermarkRef], ([v1, v2]) => {
    if (v1 && v2 && !startObserver) {
      startObserverFn()
      selfCheck()
    }
  })

  return {
    startWatch,
    disconnectAll,
  }
}
