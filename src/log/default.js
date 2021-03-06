/**
 * vConsole Default Tab
 *
 * @author WechatFE
 */

import $ from '../lib/query.js';
import * as tool from '../lib/tool.js';
import VConsoleLogTab from './log.js';
import tplTabbox from './tabbox_default.html';
import tplItemCode from './item_code.html';

class VConsoleDefaultTab extends VConsoleLogTab {

  constructor(...args) {
    super(...args);
    this.tplTabbox = tplTabbox;
    this.windowOnError = null;
  }

  onReady() {
    let that = this;
    super.onReady();

    $.bind($.one('.vc-cmd', this.$tabbox), 'submit', function(e) {
      e.preventDefault();
      let $input = $.one('.vc-cmd-input', e.target),
        cmd = $input.value;
      $input.value = '';
      if (cmd !== '') {
        that.evalCommand(cmd);
      }
    });
  }

  /**
   * replace window.console & window.onerror with vConsole method
   * @private
   */
  mockConsole() {
    super.mockConsole();
    var that = this;
    if (tool.isFunction(window.onerror)) {
      this.windowOnError = window.onerror;
    }
    window.onerror = function(message, source, lineNo, colNo, error) {
      let msg = message;
      if (source) {
        msg += "\n" + source.replace(location.origin, '');
      }
      if (lineNo || colNo) {
        msg += ':' + lineNo + ':' + colNo;
      }
      that.printLog({logType:'error', logs:[msg], noOrigin:true});
      if (tool.isFunction(that.windowOnError)) {
        that.windowOnError.apply(window, message, source, lineNo, colNo, error);
      }
    };
  }

  /**
   * 
   * @private
   */
  evalCommand(cmd) {
    // print command to console
    let date = tool.getDate(+new Date());
    this.renderLog({
      logType: 'log',
      meta: date.hour + ':' + date.minute + ':' + date.second,
      content: $.render(tplItemCode, {content: cmd, type: 'input'}, true),
      style: ''
    });
    // eval
    let result = eval(cmd);
    // print result to console
    let content = '';
    if (tool.isArray(result) || tool.isObject(result)) {
      content = this.getFoldedLine(result);
    } else {
      content = $.render(tplItemCode, {content: result, type: 'output'}, true);
    }
    this.renderLog({
      logType: 'log',
      meta: '',
      content: content,
      style: 'vc-item-nometa'
    });
  }

} // END class

const tab = new VConsoleDefaultTab('default', 'Log');

export default tab;