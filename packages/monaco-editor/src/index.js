// @flow
/* eslint-disable class-methods-use-this */
import * as React from "react";
import ReactDOM from "react-dom";

import { of } from "rxjs/observable/of";
import { fromEvent } from "rxjs/observable/fromEvent";
import type { Subscription } from "rxjs";
import { switchMap } from "rxjs/operators";

import { Map as ImmutableMap } from "immutable";

import { RichestMime } from "@nteract/display-area";

import { debounce, merge } from "lodash";

import * as monaco from "monaco-editor";

function normalizeLineEndings(str) {
  if (!str) return str;
  return str.replace(/\r\n|\r/g, "\n");
}

export type MonacoEditorProps = {
  theme: string,
  mode: string,
  onChange: (value: string) => void,
  value: string,
  focused: boolean
};

class MonacoEditor extends React.Component<MonacoEditorProps> {
  monaco: ?monaco.IStandaloneCodeEditor;
  monacoContainer: ?HTMLElement;

  static defaultProps = {
    onChange: null,
    focused: false
  };

  constructor(props: MonacoEditorProps): void {
    super(props);
  }

  componentWillMount() {
    (this: any).componentWillReceiveProps = debounce(
      this.componentWillReceiveProps,
      0
    );
  }

  onDidChangeModelContent(e): void {
    this.props.onChange(this.monaco.getValue());
  }

  componentDidMount(): void {
    const { editorFocused, kernelStatus, focusAbove, focusBelow } = this.props;
    this.monaco = monaco.editor.create(this.monacoContainer, {
      value: this.props.value,
      language: this.props.mode,
      minimap: {
        enabled: false
      },
      autoIndent: true
    });

    if (this.props.focused) {
      this.monaco.focus();
    }

    this.monaco.onDidChangeModelContent(
      this.onDidChangeModelContent.bind(this)
    );
  }

  componentDidUpdate(prevProps: MonacoEditorProps): void {
    if (!this.monaco) return;
  }

  componentWillReceiveProps(nextProps: MonacoEditorProps) {
    if (this.monaco.getValue() !== nextProps.value) {
      // FIXME: calling setValue resets cursor position in monaco. It shouldn't!
      this.monaco.setValue(nextProps.value);
    }
  }

  componentWillUnmount() {
    if (this.monaco) {
      this.monaco.dispose();
    }
  }

  render(): React$Element<any> {
    return (
      <div
        className="monaco cm-s-composition"
        ref={container => {
          this.monacoContainer = container;
        }}
      />
    );
  }
}

export default MonacoEditor;
