import { useEffect, useRef } from 'react'
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react'
import 'survey-core/survey-core.css'
import 'survey-creator-core/survey-creator-core.css'

interface Props {
  json: object
  onChange: (json: object) => void
}

export default function SurveyCreatorWrapper({ json, onChange }: Props) {
  const creatorRef = useRef<SurveyCreator | null>(null)
  if (!creatorRef.current) {
    creatorRef.current = new SurveyCreator({ showLogicTab: false, showTranslationTab: false })
    creatorRef.current.JSON = json
  }
  const creator = creatorRef.current
  useEffect(() => {
    creator.JSON = json
  }, [json])
  useEffect(() => {
    creator.onUploadFile.add(() => {})
    const save = () => onChange(creator.JSON)
    creator.onModified.add(save)
    return () => {
      creator.onModified.remove(save)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="builder-creator">
      <SurveyCreatorComponent creator={creator} />
    </div>
  )
}
