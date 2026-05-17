interface PageTitleBarProps {
  icon?: React.ReactNode;
  title: string;
  actionButton?: React.ReactNode;
}

export default function PageTitleBar(props: PageTitleBarProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        {props.icon}
        <h1 className="text-2xl font-bold">{props.title}</h1>
      </div>
      {props.actionButton}
    </div>
  );
}
