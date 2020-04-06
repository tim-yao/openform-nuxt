// Tim: This is the second part of https://au.openforms.com/Scripts/embed-iframe.js
// Made it into a ES module so we can run it in Vue.js mounted hook.
// This solved the issue that JS fire before component mounted.
// Also I removed Event Listener from `DOMContentLoaded` as it won't work with Nuxt.

/* eslint-disable */
const openformLoader = () => {
  var SeamlessOpenForms = {
    getIframeLinks: function (element) {
      // element can be a single anchor iframe link to be loaded OR a parent element that will search for all
      // anchor iframe elements to load beneath it.
      // If nothing is specified the whole document will be searched for anchor iframe links
      var lookup = document
      var isAnchorIframe = false
      if (element && element.type !== 'DOMContentLoaded') {
        if (element.classList.contains('seamless-smartform-anchor-iframe') || element.classList.contains('openforms-embed')) {
          isAnchorIframe = true
        } else {
          lookup = element
        }
      }

      var iframeLinks = []
      if (isAnchorIframe) {
        iframeLinks = [element]
      } else {
        var oldIframeLinks = Array.from(lookup.getElementsByClassName('seamless-smartform-anchor-iframe'))
        var newIframeLinks = Array.from(lookup.getElementsByClassName('openforms-embed'))
        iframeLinks = iframeLinks.concat(oldIframeLinks).concat(newIframeLinks)
      }
      return iframeLinks
    },
    loadOpenForms: function (element, externalValues) {
      // This will generate the appropriate styles and construct an iframe/s with the appropriate form
      // loaded into it.

      // Parameters can be injected into the src url of the form's iframe which can then be loaded as default values
      // using external ids that match in the form. This is typically done with hidden inputs with the of-params class
      // using the name and value of the element. externalValues can also be injected which overrides the input method.
      // External values need to be an array of object with name and value keys.
      //  [{
      //    name: Test,
      //    value: 'Bert'
      //  }, {
      //    name: Test2,
      //    value: 'Bert2'
      //  }]
      var values = []
      if (externalValues) {
        values = externalValues
      } else {
        values = document.getElementsByClassName('of-params')
      }
      var params = ''
      for (var i = 0; i < values.length; i++) {
        params += '&' + values[i].name + '=' + encodeURIComponent(values[i].value)
      }

      var iframeLinks = SeamlessOpenForms.getIframeLinks(element)
      for (var i = iframeLinks.length - 1; i >= 0; i--) {
        var iframeLink = iframeLinks[i]
        var baseURL = iframeLink.href.replace(iframeLink.pathname + iframeLink.search, '')

        // Inject a link element that loads materialize loader css for the loading animation
        var style = document.createElement('link')
        var styleId = 'openforms-embed-styling-' + i
        style.setAttribute('href', baseURL + '/Content/materialize-loader.css')
        style.setAttribute('rel', 'stylesheet')
        style.setAttribute('id', styleId)
        iframeLink.parentNode.insertBefore(style, iframeLink)

        // Add a loading animation before the iframe
        var loader = document.createElement('div')
        var loaderId = 'openforms-embed-loader-' + i
        loader.setAttribute('id', loaderId)
        loader.className = 'openforms-loader'
        loader.innerHTML = '<div>Loading form...</div><div class="progress"><div class="indeterminate"></div></div>'
        iframeLink.parentNode.insertBefore(loader, iframeLink)

        // Generate the iframe to load into the page with the form url.
        var iframe = document.createElement('iframe')
        var iframeId = 'openforms-embed-iframe-' + i
        var iframeSrc = iframeLink.getAttribute('href')
        iframe.id = iframeId
        // The background color of the anchor link element's parent is passed to the form to use as the background
        // Any parameters passed in by of-params elements is also appended to the src.
        iframe.src = iframeSrc + '?of-url=' + encodeURIComponent(window.location.href) + '&of-color=' + window.getComputedStyle(iframeLink.parentNode, null).getPropertyValue('background-color').replace(/ /g, '') + params
        iframe.style.width = '100%'
        iframe.style.height = '0'
        iframe.style.border = 'none'
        iframe.setAttribute('scrolling', 'no')
        iframe.setAttribute('onLoad', 'seamlessOpenFormsAutoResize("' + iframeId + '", "' + loaderId + '", "' + styleId + '");')
        iframe.name = iframeId
        iframeLink.parentNode.replaceChild(iframe, iframeLink)
      }
    },
    scrollToTop: function (id) {
      var iframe = document.getElementsByName(id)[0]
      // Align form top to 20% of the current viewport
      var targetOffset = Math.floor(SeamlessOpenForms.getOffset(iframe).top - window.innerHeight * 0.2)
      // Ensure targetOffset is not negative
      targetOffset = Math.max(0, targetOffset)
      SeamlessOpenForms.scrollToElement(document.body, targetOffset, 500)
    },
    scrollYBottom: function (id, offset) {
      var iframe = document.getElementsByName(id)[0]
      var elementOffset = Math.floor(offset) || 0
      var rootOffset = Math.floor(SeamlessOpenForms.getOffset(iframe).top)
      SeamlessOpenForms.scrollToElement(document.body, rootOffset + elementOffset - window.innerHeight, 500)
    },
    scrollYTop: function (id, offset) {
      var iframe = document.getElementsByName(id)[0]
      var elementOffset = Math.floor(offset) || 0
      var rootOffset = Math.floor(SeamlessOpenForms.getOffset(iframe).top)
      /* When auto scrolling should prefer to
        - if the current elementOffset is within the window view port, just scroll to the form top
        - */
      var targetWindowOffset = Math.floor(window.innerHeight * 0.5)
      if (elementOffset > targetWindowOffset) {
        // Move element to the middle of the viewport
        SeamlessOpenForms.scrollToElement(document.body, Math.max(0, rootOffset + elementOffset - targetWindowOffset), 500)
      } else {
        // else just scroll to top
        SeamlessOpenForms.scrollToTop(id)
      }
    },
    scrollToElement: function (element, to, duration) {
      var start = window.pageYOffset
      var change = to - start
      var increment = 20

      var animateScroll = function (elapsedTime) {
        elapsedTime += increment
        var position = SeamlessOpenForms.easeInOut(elapsedTime, start, change, duration)
        window.scroll(window.pageXOffset, position)
        if (elapsedTime < duration) {
          setTimeout(function () {
            animateScroll(elapsedTime)
          }, increment)
        }
      }
      animateScroll(0)
    },
    easeInOut: function (currentTime, start, change, duration) {
      currentTime /= duration / 2
      if (currentTime < 1) {
        return change / 2 * currentTime * currentTime + start
      }
      currentTime -= 1
      return -change / 2 * (currentTime * (currentTime - 2) - 1) + start
    },
    getOffset: function (el) {
      el = el.getBoundingClientRect()
      return {
        left: el.left + window.pageXOffset,
        top: el.top + window.pageYOffset
      }
    },
    scrollToTopEvent: function (event) {
      var data = event.data.split('\uE001')
      if (event.data.indexOf('scrollTop') === 0) {
        SeamlessOpenForms.scrollToTop(event.data.replace('scrollTop:', ''))
      } else if (event.data.indexOf('scrollYBottom') === 0) {
        // Post message only used in date field at the moment
        SeamlessOpenForms.scrollYBottom(data[0].replace('scrollYBottom:', ''), data[1])
      } else if (event.data.indexOf('scrollYTop') === 0) {
        SeamlessOpenForms.scrollYTop(data[0].replace('scrollYTop:', ''), data[1])
      }
    }
  }

  // (Tim) Changed listen to `DOMContentLoaded` to fire directly.
  // window.addEventListener('DOMContentLoaded', SeamlessOpenForms.loadOpenForms)
  SeamlessOpenForms.loadOpenForms()

  // TODO: (Tim) below throws error, need investigation. It cause scroll not working.
  // if (typeof (window.postMessage) !== 'undefined') {
  //   if (typeof (window.addEventListener) !== 'undefined') {
  //     window.addEventListener('message', SeamlessOpenForms.scrollToTopEvent, false)
  //   } else {
  //     window.attachEvent('onmessage', SeamlessOpenForms.scrollToTopEvent)
  //   }
  // }
}

export default openformLoader