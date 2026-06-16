import React from 'react';

const FILTERED_PROPS = [
  'x-line-number',
  'x-file-name',
  'x-id',
  'x-component',
  'data-line-number',
  'data-file-name',
  'data-id',
  'data-component'
];

export const filterR3FProps = (props) => {
  if (!props || typeof props !== 'object') return props;
  
  const filtered = { ...props };
  FILTERED_PROPS.forEach(prop => {
    delete filtered[prop];
  });
  
  return filtered;
};

export const R3FGroup = React.forwardRef(({ children, ...props }, ref) => {
  const cleanProps = filterR3FProps(props);
  return React.createElement('group', { ref, ...cleanProps }, children);
});

export const R3FMesh = React.forwardRef(({ children, ...props }, ref) => {
  const cleanProps = filterR3FProps(props);
  return React.createElement('mesh', { ref, ...cleanProps }, children);
});
